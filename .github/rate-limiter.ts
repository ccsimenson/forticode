import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { rateLimit } from 'express-rate-limit';
import requestIp from 'express-request-ip';

// GitHub API rate limits
const GITHUB_RATE_LIMITS = {
  core: {
    points: 5000, // Default GitHub rate limit
    duration: 3600, // 1 hour
  },
  search: {
    points: 30, // Default GitHub search rate limit
    duration: 60, // 1 minute
  },
};

// Create rate limiters
const coreRateLimiter = rateLimit({
  windowMs: GITHUB_RATE_LIMITS.core.duration * 1000,
  max: GITHUB_RATE_LIMITS.core.points,
  message: 'Too many requests. Please try again later.',
  keyGenerator: (req) => req.ip || 'unknown'
});

const searchRateLimiter = rateLimit({
  windowMs: GITHUB_RATE_LIMITS.search.duration * 1000,
  max: GITHUB_RATE_LIMITS.search.points,
  message: 'Too many search requests. Please try again later.',
  keyGenerator: (req) => req.ip || 'unknown'
});

// Rate limiter middleware
export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = req.path;
    
    if (path.includes('search')) {
      searchRateLimiter(req, res, next);
    } else {
      coreRateLimiter(req, res, next);
    }
  } catch (error) {
    logger.error('Rate limiter middleware error', { error });
    next(error);
  }
};

// Rate limiter decorator
export function rateLimited(points: number, duration: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction, ...args: any[]) {
      const ip = req.ip || 'unknown';
      
      try {
        await coreRateLimiter(req, res, next);
        return await originalMethod.apply(this, [req, ...args]);
      } catch (error) {
        logger.warn('Rate limit exceeded', { method: propertyKey, ip });
        throw error;
      }
    };
  };
}

export { coreRateLimiter, searchRateLimiter };
