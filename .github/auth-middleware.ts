import { Request, Response, NextFunction } from 'express';
import { createGithubAuth } from './github-auth';
import { logger } from './logger';
import { GitHubAppConfig } from './github-app.config';

// Verify webhook signature
export const verifyWebhookSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) {
      logger.warn('Missing webhook signature');
      throw new Error('Missing webhook signature');
    }

    const payload = JSON.stringify(req.body);
    const verified = await verifyWebhookSignature(signature, payload);

    logger.info('Webhook signature verified', { verified });
    if (!verified) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Store event type and installation ID in session
    if (req.session) {
      req.session.eventType = req.headers['x-github-event'] as string;
      req.session.installationId = req.headers['x-github-installation-id'] as string;
    }

    next();
  } catch (error) {
    logger.error('Error verifying webhook signature', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify JWT token
export const verifyJwtToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Missing JWT token');
      return res.status(401).json({ error: 'Missing JWT token' });
    }

    const auth = await createGithubAuth();
    const verified = await auth({
      type: 'token',
      token
    });

    if (!verified) {
      logger.warn('Invalid JWT token');
      return res.status(401).json({ error: 'Invalid JWT token' });
    }

    next();
  } catch (error) {
    logger.error('Error verifying JWT token', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get installation token
export const getInstallationToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const installationId = req.params.installationId;
    const auth = await createGithubAuth();
    const token = await auth({
      type: 'installation',
      installationId: parseInt(installationId)
    });

    if (req.session) {
      req.session.installationToken = token;
    }
    next();
  } catch (error) {
    logger.error('Error getting installation token', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get OAuth token
export const getOAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code as string;
    const auth = await createGithubAuth();
    const token = await auth({
      type: 'oauth-user',
      code
    });

    if (req.session) {
      req.session.oauthToken = token;
    }
    next();
  } catch (error) {
    logger.error('Error getting OAuth token', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify installation token
export const installationTokenVerifier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid JWT token', {
        path: req.path
      });
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid JWT token' });
    }

    const token = authHeader.split(' ')[1];
    const auth = await createGithubAuth();
    const isValid = await auth.verifyJwtToken(token, process.env.JWT_SECRET);

    if (!isValid) {
      logSecurityEvent('invalid_jwt_token', 'Invalid JWT token', {
        tokenLength: token.length
      });
      return res.status(401).json({ error: 'Unauthorized - Invalid JWT token' });
    }

    // Add JWT claims to request
    const claims = await auth.decodeJwtToken(token);
    req['jwtClaims'] = claims;

    next();
  } catch (error) {
    logSecurityEvent('jwt_verification_error', 'Error verifying JWT token', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    res.status(500).json({ error: 'JWT verification error' });
  }
};
