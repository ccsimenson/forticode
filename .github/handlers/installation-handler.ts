import { InstallationEvent } from '../types/webhook.types';
import { config, GitHubAppConfig } from '../github-app.config';
import { LRUCache } from 'lru-cache';
import { logger } from '../logger';

// Cache for GitHub API responses
const githubCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 300000, // 5 minutes
});

export class InstallationHandler {
  constructor(private readonly config: GitHubAppConfig) {}

  private async getInstallationToken(installationId: number): Promise<string | null> {
    const cacheKey = `installation_token_${installationId}`;
    
    // Check cache first
    const cachedToken = githubCache.get(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    try {
      const { data } = await this.config.octokit.apps.createInstallationAccessToken({
        installation_id: installationId,
      });
      const token = data.token;

      // Cache the token for 55 minutes (5 minutes less than the token's 60-minute lifetime)
      githubCache.set(cacheKey, token, { ttl: 3300000 });
      return token;
    } catch (error) {
      logger.error('Failed to get installation token', { error });
      return null;
    }
  }

  async handle(event: InstallationEvent) {
    try {
      if (!event.installation?.id) {
        throw new Error('Missing installation ID');
      }

      const token = await this.getInstallationToken(event.installation.id);
      if (!token) {
        throw new Error('Failed to get installation token');
      }

      switch (event.action) {
        case 'created':
          await this.createWebhook(event.installation.id, token);
          break;
        case 'deleted':
          await this.deleteWebhooks(event.installation.id, token);
          break;
        default:
          logger.warn('Unknown installation event action', { action: event.action });
      }
    } catch (error) {
      logger.error('Error handling installation event', { error });
      throw error;
    }
  }

  private async createWebhook(installationId: number, token: string) {
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
      logger.error('Failed to create webhook', { error });
      throw error;
    }
  }

  private async deleteWebhooks(installationId: number, token: string) {
    try {
      const { data: hooks } = await config.octokit.request('GET /repos/{owner}/{repo}/hooks', {
        owner: config.owner,
        repo: config.repo,
        headers: {
          authorization: `token ${token}`,
        },
      });

      for (const hook of hooks) {
        await config.octokit.request('DELETE /repos/{owner}/{repo}/hooks/{hook_id}', {
          owner: config.owner,
          repo: config.repo,
          hook_id: hook.id,
          headers: {
            authorization: `token ${token}`,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to delete webhooks', { error });
      throw error;
    }
  }
}
