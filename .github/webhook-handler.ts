import { Request, Response, NextFunction } from 'express';
import { verifyWebhookSignature } from './auth-middleware';
import { logger } from './logger';
import { config, GitHubAppConfig } from './github-app.config';
import { InstallationHandler } from './handlers/installation-handler';
import { RepositoryHandler } from './handlers/repository-handler';
import { PullRequestHandler } from './handlers/pull-request-handler';
import { PullRequestReviewHandler } from './handlers/pull-request-review-handler';

export class WebhookHandler {
  private handlers = {
    installation: new InstallationHandler(config),
    repository: new RepositoryHandler(config),
    pull_request: new PullRequestHandler(config),
    pull_request_review: new PullRequestReviewHandler(config)
  };

  constructor(public readonly config: GitHubAppConfig) {}

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      await verifyWebhookSignature(req, res, (error) => {
        if (error) {
          throw new Error('Invalid webhook signature');
        }
      });

      const eventType = req.headers['x-github-event'] as string;
      const payload = req.body;

      const handler = this.handlers[eventType];
      if (!handler) {
        logger.warn(`No handler for event type: ${eventType}`);
        res.status(200).send('OK');
        return;
      }

      await handler.handle(payload);
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Webhook error', { error });
      next(error);
    }
  }
}

// Export a singleton instance
export const webhookHandler = new WebhookHandler(config);
