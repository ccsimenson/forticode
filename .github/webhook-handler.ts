import { Request, Response, NextFunction } from 'express';
import { createGithubAuth } from './github-auth';
import { logger } from './logger';
import { verifyWebhookSignature } from './auth-middleware';
import { GitHubAppConfig } from './github-app.config';

interface WebhookEvent {
  action?: string;
  installation?: {
    id: number;
  };
  repository?: {
    full_name: string;
    id: number;
    [key: string]: any;
  };
  repositories?: Array<{
    full_name: string;
    id: number;
    [key: string]: any;
  }>;
  pull_request?: {
    id: number;
    [key: string]: any;
  };
  repositories_added?: Array<{
    id: number;
    [key: string]: any;
  }>;
  repositories_removed?: Array<{
    id: number;
    [key: string]: any;
  }>;
  review?: {
    id: number;
    state: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Handle GitHub webhook events
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const eventType = req.headers['x-github-event'];
    const payload = req.body as WebhookEvent;

    logger.info('Received webhook event', {
      eventType,
      installationId: payload.installation?.id,
      repositoryIds: payload.repositories?.map(repo => repo.id),
      pullRequestId: payload.pull_request?.id
    });

    // Verify webhook signature
    if (typeof signature !== 'string') {
      logger.warn('Missing webhook signature');
      return res.status(401).json({ error: 'Missing webhook signature' });
    }
    
    await verifyWebhookSignature(req, res, (error) => {
      if (error) {
        logger.warn('Invalid webhook signature', { error });
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    });
    
    // If we get here, verification was successful
    next();
    return;

    // Handle different event types
    switch (eventType) {
      case 'installation':
        await handleInstallationEvent(payload);
        break;
      case 'installation_repositories':
        await handleInstallationRepositoriesEvent(payload);
        break;
      case 'pull_request':
        await handlePullRequestEvent(payload);
        break;
      case 'pull_request_review':
        await handlePullRequestReviewEvent(payload);
        break;
      default:
        logger.info('Unhandled webhook event', { eventType });
        break;
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    logger.error('Error handling webhook', { error });
    res.status(500).json({ error: 'Internal server error' });
    next(error);
  }
};

// Handle installation event
const handleInstallationEvent = async (payload: WebhookEvent) => {
  try {
    const installationId = payload.installation?.id;
    const repositories = payload.repositories;

    logger.info('Installation event received', {
      installationId,
      repositoryCount: repositories?.length
    });

    // TODO: Handle installation event
  } catch (error) {
    logger.error('Error handling installation event', error);
    throw error;
  }
};

// Handle installation repositories event
const handleInstallationRepositoriesEvent = async (payload: WebhookEvent) => {
  try {
    const installationId = payload.installation?.id;
    const action = payload.action;
    const repositories = payload.repositories_added || payload.repositories_removed;

    logger.info('Installation repositories event received', {
      installationId,
      action,
      repositoryCount: repositories?.length
    });

    // TODO: Handle installation repositories event
  } catch (error) {
    logger.error('Error handling installation repositories event', error);
    throw error;
  }
};

// Handle pull request event
const handlePullRequestEvent = async (payload: WebhookEvent) => {
  try {
    const installationId = payload.installation?.id;
    const repositoryId = payload.repository?.id;
    const pullRequestId = payload.pull_request?.id;
    const action = payload.action;

    logger.info('Pull request event received', {
      installationId,
      repositoryId,
      pullRequestId,
      action
    });

    // TODO: Handle pull request event
  } catch (error) {
    logger.error('Error handling pull request event', error);
    throw error;
  }
};

// Handle pull request review event
const handlePullRequestReviewEvent = async (payload: WebhookEvent) => {
  try {
    const installationId = payload.installation?.id;
    const repositoryId = payload.repository?.id;
    const pullRequest = payload.pull_request;
    const review = payload.review;

    logger.info('Pull request review event received', {
      installationId,
      repositoryId,
      pullRequest: {
        id: pullRequest?.id,
        number: pullRequest?.number
      },
      review: {
        id: review?.id,
        state: review?.state
      },
      action: payload.action
    });

    // Implement pull request review handling logic here
  } catch (error) {
    logger.error('Error handling pull request review event', error);
  }
};

// Create webhook for repository
const createWebhook = async (installationId: number | undefined, token: string) => {
  try {
    if (!installationId) {
      throw new Error('Installation ID is required');
    }
    
    // Get repository details to create webhook
    const repoResponse = await fetch(`https://api.github.com/installation/repositories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Electron-Security-Auditor'
      }
    });
    
    if (!repoResponse.ok) {
      const error = await repoResponse.json();
      throw new Error(`Failed to fetch repositories: ${error.message || repoResponse.statusText}`);
    }
    
    const repos = await repoResponse.json();
    const repo = repos.repositories?.[0];
    
    if (!repo) {
      throw new Error('No repositories found for installation');
    }
    
    // Create webhook for the first repository
    const webhookResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/hooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Electron-Security-Auditor'
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request', 'installation', 'installation_repositories'],
        config: {
          url: GitHubAppConfig.fullWebhookUrl,
          content_type: 'json',
          secret: GitHubAppConfig.webhookSecret,
          insecure_ssl: process.env.NODE_ENV === 'production' ? '0' : '1'
        }
      })
    });
  } catch (error) {
    logger.error('Error creating webhook', error);
  }
};

// Handle pull request opened
const handlePullRequestOpened = async (event: WebhookEvent, token: string) => {
  try {
    // Create review
    await fetch(`https://api.github.com/repos/${event.repository?.name}/pulls/${event.pull_request?.number}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        body: 'Initial review comment',
        event: 'COMMENT'
      })
    });
  } catch (error) {
    logger.error('Error handling pull request opened', error);
  }
};

// Handle pull request synchronize
const handlePullRequestSynchronize = async (event: WebhookEvent, token: string) => {
  try {
    // Update review
    await fetch(`https://api.github.com/repos/${event.repository?.name}/pulls/${event.pull_request?.number}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        body: 'Updated review comment',
        event: 'COMMENT'
      })
    });
  } catch (error) {
    logger.error('Error handling pull request synchronize', error);
  }
};

// Handle pull request closed
const handlePullRequestClosed = async (event: WebhookEvent, token: string) => {
  try {
    // Handle closed pull request
    if (event.pull_request?.merged) {
      await fetch(`https://api.github.com/repos/${event.repository?.name}/pulls/${event.pull_request?.number}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          body: 'Pull request merged successfully',
          event: 'COMMENT'
        })
      });
    }
  } catch (error) {
    logger.error('Error handling pull request closed', error);
  }
};

// Process commit
const processCommit = async (repositoryId: number | undefined, commit: any, token: string) => {
  try {
    // Process commit
    // Add your commit processing logic here
  } catch (error) {
    logger.error('Error processing commit', error);
  }
};
