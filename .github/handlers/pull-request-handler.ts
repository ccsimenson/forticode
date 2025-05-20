import { PullRequestEvent } from '../types/webhook.types';
import { GitHubAppConfig } from '../github-app.config';
import { logger } from '../logger';

export class PullRequestHandler {
  constructor(private config: GitHubAppConfig) {}

  async handle(event: PullRequestEvent) {
    try {
      if (!event.pull_request?.id || !event.repository?.owner?.login || !event.repository?.name || !event.installation?.id) {
        throw new Error('Missing required pull request data');
      }

      const { data } = await this.config.octokit.apps.createInstallationAccessToken({
        installation_id: event.installation.id,
      });
      const token = data.token;

      if (!token) {
        throw new Error('Failed to get installation token');
      }

      switch (event.action) {
        case 'opened':
          await this.handlePullRequestOpened(event, token);
          break;
        case 'synchronize':
          await this.handlePullRequestSynchronize(event, token);
          break;
        case 'closed':
          await this.handlePullRequestClosed(event, token);
          break;
        default:
          logger.warn('Unknown pull request action', { action: event.action });
      }
    } catch (error) {
      logger.error('Error handling pull request event', { error });
      throw error;
    }
  }

  private async handlePullRequestOpened(event: PullRequestEvent, token: string) {
    try {
      if (!event.repository?.owner?.login || !event.repository?.name) {
        throw new Error('Missing repository owner or name');
      }

      // Process the opened pull request
      await this.config.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: event.repository.owner.login,
        repo: event.repository.name,
        pull_number: event.pull_request.number,
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to process pull request opened', { error });
      throw error;
    }
  }

  private async handlePullRequestSynchronize(event: PullRequestEvent, token: string) {
    try {
      if (!event.repository?.owner?.login || !event.repository?.name) {
        throw new Error('Missing repository owner or name');
      }

      // Process pull request synchronization
      await this.config.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
        owner: event.repository.owner.login,
        repo: event.repository.name,
        pull_number: event.pull_request.number,
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to process pull request synchronize', { error });
      throw error;
    }
  }

  private async handlePullRequestClosed(event: PullRequestEvent, token: string) {
    try {
      if (!event.repository?.owner?.login || !event.repository?.name) {
        throw new Error('Missing repository owner or name');
      }

      // Process closed pull request
      await this.config.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
        owner: event.repository.owner.login,
        repo: event.repository.name,
        pull_number: event.pull_request.number,
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to process pull request closed', { error });
      throw error;
    }
  }
}
