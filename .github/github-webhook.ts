import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { webhookHandler as webhookHandlerInstance } from './webhook-handler';

// Webhook endpoint
export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle webhook using the exported singleton instance
    await webhookHandlerInstance.handleWebhook(req, res, next);

    // Log webhook event
    logger.info('Webhook received', {
      webhookPath: webhookHandlerInstance.config.webhookPath,
      webhookPort: webhookHandlerInstance.config.webhookPort
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error handling webhook', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
};