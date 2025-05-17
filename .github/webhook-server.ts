import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { webhookHandler } from './webhook-handler';
import { createGithubAuth } from './github-auth';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { securityLogger, logSecurityEvent, logger } from './logger';
import { webhookSignatureVerifier, jwtTokenVerifier } from './auth-middleware';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

// Load configuration from YAML file
const configPath = path.join(process.cwd(), '.env.yaml');
const config = yaml.parse(fs.readFileSync(configPath, 'utf-8')) as {
  FRONTEND_URL: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_WEBHOOK_SECRET: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  GITHUB_APP_BASE_URL: string;
  GITHUB_WEBHOOK_PATH: string;
  GITHUB_WEBHOOK_PORT: string;
  GITHUB_AUTH_REDIRECT_URI: string;
};

// Extend Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: {
        githubToken?: string;
        userId?: string;
      };
    }
  }
}

const app = express();

// Security middleware
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use(limiter);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: true
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: config.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({
  limit: '1mb',
  type: ['application/json', 'application/x-www-form-urlencoded']
}));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Add security logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });
  next();
});

// Log startup
logger.info('Webhook server starting up', {
  port: parseInt(config.GITHUB_WEBHOOK_PORT),
  webhookPath: config.GITHUB_WEBHOOK_PATH,
  environment: process.env.NODE_ENV || 'development'
});

// Webhook endpoint
app.post(config.GITHUB_WEBHOOK_PATH, webhookSignatureVerifier, async (req: Request, res: Response) => {
  try {
    if (!req.session) {
      logger.warn('Session not available');
      return res.status(401).json({ error: 'Session not available' });
    }

    // Log webhook details
    logger.info('Webhook received', {
      type: req.headers['x-github-event'],
      id: req.headers['x-github-delivery']
    });

    // Handle the webhook event
    await webhookHandler(req, res);
  } catch (error) {
    logger.error('Error processing webhook', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// OAuth callback endpoint
app.get('/auth/github/callback', jwtTokenVerifier, async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('No code provided');
    }

    // Log OAuth attempt
    logger.info('OAuth callback received', {
      codeLength: code.length
    });

    // Exchange code for access token
    const auth = await createGithubAuth();
    const { token } = await auth({
      type: 'oauth',
      code: code as string,
      redirect_uri: process.env.GITHUB_AUTH_REDIRECT_URI
    });

    // Set up session
    req.session.githubToken = token;
    
    // Log successful OAuth
    logger.info('OAuth completed successfully', {
      userId: req.session.userId,
      tokenLength: token.length
    });
    
    // Redirect to success page
    res.redirect('/auth/success');
  } catch (error) {
    // Log OAuth error
    logSecurityEvent('oauth_error', 'OAuth callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
const startServer = async () => {
  try {
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST']
      }
    });

    // Socket.IO connection events
    io.on('connection', (socket) => {
      logger.info('Socket connection established', {
        socketId: socket.id
      });
      
      socket.on('disconnect', () => {
        logger.info('Socket connection closed', {
          socketId: socket.id
        });
      });
    });

    // Socket.IO connection handler
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Handle security scan updates
      socket.on('security-scan-update', (data) => {
        console.log('Security scan update:', data);
        // Broadcast to all clients
        io.emit('security-scan-update', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Start server
    const port = WEBHOOK_CONFIG.port;
    httpServer.listen(port, () => {
      console.log(`GitHub webhook server running on port ${port}`);
      console.log(`Webhook endpoint: http://localhost:${port}${WEBHOOK_CONFIG.path}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
