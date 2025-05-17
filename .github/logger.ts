import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import 'express-session'; // This import is needed for module augmentation

// Extend express session types
declare module 'express-session' {
  interface SessionData {
    githubToken?: string;
    userId?: string;
    installationId?: string;
    repositoryIds?: number[];
    pullRequestId?: number;
    installationToken?: string;
    oauthToken?: string;
  }
}

// Extend express request with our custom properties
type ExtendedRequest = Request & {
  startTime?: number;
  session: session.Session & Partial<session.SessionData>;
};

// Winston configuration
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// Add console transport if not in production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;

    // Log request
    logger.info('Request completed', {
      duration,
      status,
      method,
      url
    });
  });

  res.on('close', () => {
    logger.warn('Request closed prematurely', {
      method: req.method,
      url: req.originalUrl
    });
  });

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: ExtendedRequest, res: Response, next: NextFunction) => {
  logger.error('Error', {
    error: error.message,
    stack: error.stack,
    installationId: req.session?.installationId,
    repositoryIds: req.session?.repositoryIds,
    pullRequestId: req.session?.pullRequestId
  });
  next();
};

// Log GitHub API calls
export const logGithubApiCall = (req: ExtendedRequest, method: string, path: string, details?: any) => {
  logger.info('GitHub API call', {
    method,
    path,
    installationId: req.session?.installationId,
    repositoryIds: req.session?.repositoryIds,
    pullRequestId: req.session?.pullRequestId,
    ...details
  });
};

// Log authentication events
export const logAuthEvent = (req: ExtendedRequest, event: string, details?: any) => {
  logger.info('Authentication event', {
    event,
    installationId: req.session?.installationId,
    repositoryIds: req.session?.repositoryIds,
    pullRequestId: req.session?.pullRequestId,
    ...details
  });
};

// Log errors
export const logError = (req: ExtendedRequest, error: Error, details?: any) => {
  logger.error('Error', {
    error: error.message,
    stack: error.stack,
    installationId: req.session?.installationId,
    repositoryIds: req.session?.repositoryIds,
    pullRequestId: req.session?.pullRequestId,
    ...details
  });
};

// Export logger instance
export const getLogger = () => logger;
export default getLogger;
