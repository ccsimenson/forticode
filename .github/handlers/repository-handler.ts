import { RepositoryEvent } from '../types/webhook.types';
import { config, GitHubAppConfig } from '../github-app.config';
import { logger } from '../logger';

export class RepositoryHandler {
  constructor(private readonly config: GitHubAppConfig) {}

  async handle(event: RepositoryEvent) {
    try {
      if (!event.installation?.id) {
        throw new Error('Missing installation ID');
      }

      const { data } = await this.config.octokit.apps.createInstallationAccessToken({
        installation_id: event.installation?.id,
      });
      const token = data.token;

      if (!token) {
        throw new Error('Failed to get installation token');
      }

      // Handle repository additions/removals
      if (event.repositories_added?.length) {
        for (const repo of event.repositories_added) {
          await this.createWebhookForRepo(repo.id, token);
        }
      }

      if (event.repositories_removed?.length) {
        for (const repo of event.repositories_removed) {
          await this.deleteWebhookForRepo(repo.id, token);
        }
      }
    } catch (error) {
      logger.error('Error handling repository event', { error });
      throw error;
    }
  }

  private async createWebhookForRepo(repoId: number, token: string) {
    try {
      await config.octokit.request('POST /repos/{owner}/{repo}/hooks', {
        owner: config.owner,
        repo: config.repo,
        headers: {
          authorization: `token ${token}`,
        },
        name: 'web',
        active: true,
        events: ['*'],
        config: {
          url: config.webhookUrl,
          content_type: 'json',
          secret: config.webhookSecret,
        },
      });
    } catch (error) {
      logger.error('Failed to create webhook for repo', { error });
      throw error;
    }
  }

  private async deleteWebhookForRepo(repoId: number, token: string) {
    try {
      const webhooks = await config.octokit.request('GET /repos/{owner}/{repo}/hooks', {
        owner: config.owner,
        repo: config.repo,
        headers: {
          authorization: `token ${token}`,
        },
      });

      for (const webhook of webhooks.data) {
        if (webhook.config?.url === config.webhookUrl) {
          await config.octokit.request('DELETE /repos/{owner}/{repo}/hooks/{hook_id}', {
            owner: config.owner,
            repo: config.repo,
            hook_id: webhook.id,
            headers: {
              authorization: `token ${token}`,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Failed to delete webhook for repo', { error });
      throw error;
    }
  }
}
