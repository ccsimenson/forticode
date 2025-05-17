import { Request, Response } from 'express';
import { GitHubAppConfig } from './github-app.config';
import { logger } from './logger';
import { verifyWebhookSignature } from './auth-middleware';
import { handleWebhook } from './webhook-handler';

// Webhook endpoint
export const webhookHandler = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    await verifyWebhookSignature(req, res, () => {});

    // Log webhook event
    logger.info('Webhook received', {
      webhookPath: GitHubAppConfig.WEBHOOK_PATH,
      webhookPort: GitHubAppConfig.WEBHOOK_PORT
    });

    // Handle webhook
    await handleWebhook(req, res);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling webhook', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};