import { createAppAuth } from '@octokit/auth-app';
import { createTokenAuth } from '@octokit/auth-token';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { GitHubAppConfig } from './github-app.config';
import { createHash } from 'crypto';
import { logger } from './logger';
import { Request, Response, NextFunction } from 'express';
import { Webhooks } from '@octokit/webhooks';

// Cache for auth instances
const authCache = new Map<string, any>();

// Create GitHub auth instance
export const createGithubAuth = async () => {
  try {
    const auth = createAppAuth({
      appId: parseInt(process.env.GITHUB_APP_ID || '0'),
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY || '',
      clientId: process.env.GITHUB_APP_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET || ''
    });

    logger.info('GitHub auth instance created');
    return auth;
  } catch (error) {
    logger.error('Error creating GitHub auth instance', error);
    throw error;
  }
};

// Get cached auth instance
export const getGithubAuth = async () => {
  try {
    const cacheKey = `${process.env.GITHUB_APP_ID}-${process.env.GITHUB_APP_PRIVATE_KEY}`;
    const auth = authCache.get(cacheKey);

    if (auth) {
      return auth;
    }

    const newAuth = await createGithubAuth();
    authCache.set(cacheKey, newAuth);
    return newAuth;
  } catch (error) {
    logger.error('Error getting GitHub auth', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyWebhookSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);

    if (!signature || !payload) {
      logger.warn('Missing webhook signature or body', {
        headers: req.headers,
        hasSignature: !!signature,
        hasBody: !!req.body
      });
      return res.status(401).json({ error: 'Missing webhook signature or body' });
    }

    // Create a hash of the payload using the secret
    const hash = createHash('sha256');
    hash.update(payload);
    const expectedSignature = `sha256=${hash.digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature', {
        signature,
        expectedSignature
      });
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    logger.info('Webhook signature verified');
    next();
  } catch (error) {
    logger.error('Error verifying webhook signature', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get installation access token
export const getInstallationToken = async ({
  installationId
}: {
  installationId: number;
}) => {
  try {
    const auth = await getGithubAuth();
    const installation = await auth({
      type: 'installation',
      installationId
    });

    return installation;
  } catch (error) {
    logger.error('Error getting installation token', error);
    throw error;
  }
};

// Verify JWT token
export const verifyJwtToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await getGithubAuth();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Missing authorization token', {
        headers: req.headers
      });
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const installation = await auth({
      type: 'oauth-app',
      token
    });

    if (!installation) {
      logger.warn('Invalid token', {
        token: '***', // Mask token for security
        headers: req.headers
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    next();
  } catch (error) {
    logger.error('Error verifying JWT token', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify GitHub token
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const auth = await getGithubAuth();
    const installation = await auth({
      type: 'oauth-app',
      token
    });

    return !!installation;
  } catch (error) {
    logger.error('Error verifying token', error);
    return false;
  }
};