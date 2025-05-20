import { PullRequestReviewEvent } from '../types/webhook.types';
import { GitHubAppConfig } from '../github-app.config';
import { logger } from '../logger';

export class PullRequestReviewHandler {
  constructor(private config: GitHubAppConfig) {}

  async handle(event: PullRequestReviewEvent) {
    try {
      if (!event.pull_request?.id || !event.review?.id || !event.repository?.owner?.login || !event.repository?.name || !event.installation?.id) {
        throw new Error('Missing required review data');
      }

      const { data } = await this.config.octokit.apps.createInstallationAccessToken({
        installation_id: event.installation.id,
      });
      const token = data.token;

      if (!token) {
        throw new Error('Failed to get installation token');
      }

      // Process the review
      await this.processPullRequestReview(event, token);
    } catch (error) {
      logger.error('Error handling pull request review event', { error });
      throw error;
    }
  }

  private async processPullRequestReview(event: PullRequestReviewEvent, token: string) {
    try {
      if (!event.repository?.owner?.login || !event.repository?.name) {
        throw new Error('Missing repository owner or name');
      }

      // Get review details
      const review = await this.config.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}', {
        owner: event.repository.owner.login,
        repo: event.repository.name,
        pull_number: event.pull_request.number,
        review_id: event.review.id,
        headers: {
          authorization: `token ${token}`,
        },
      });

      // Process the review based on its state
      switch (event.review.state.toLowerCase()) {
        case 'approved':
          await this.handleApprovedReview(review.data, token);
          break;
        case 'changes_requested':
          await this.handleChangesRequested(review.data, token);
          break;
        case 'commented':
          await this.handleCommentedReview(review.data, token);
          break;
        default:
          logger.warn('Unknown review state', { state: event.review.state });
      }
    } catch (error) {
      logger.error('Failed to process pull request review', { error });
      throw error;
    }
  }

  private async handleApprovedReview(review: any, token: string) {
    try {
      if (!review?.repository?.owner?.login || !review?.repository?.name) {
        throw new Error('Missing repository owner or name in review data');
      }

      // Handle approved review
      await this.config.octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events', {
        owner: review.repository.owner.login,
        repo: review.repository.name,
        pull_number: review.pull_request_number,
        review_id: review.id,
        event: 'APPROVE',
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to handle approved review', { error });
      throw error;
    }
  }

  private async handleChangesRequested(review: any, token: string) {
    try {
      if (!review?.repository?.owner?.login || !review?.repository?.name) {
        throw new Error('Missing repository owner or name in review data');
      }

      // Handle changes requested
      await this.config.octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events', {
        owner: review.repository.owner.login,
        repo: review.repository.name,
        pull_number: review.pull_request_number,
        review_id: review.id,
        event: 'REQUEST_CHANGES',
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to handle changes requested', { error });
      throw error;
    }
  }

  private async handleCommentedReview(review: any, token: string) {
    try {
      if (!review?.repository?.owner?.login || !review?.repository?.name) {
        throw new Error('Missing repository owner or name in review data');
      }

      // Handle commented review
      await this.config.octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events', {
        owner: review.repository.owner.login,
        repo: review.repository.name,
        pull_number: review.pull_request_number,
        review_id: review.id,
        event: 'COMMENT',
        headers: {
          authorization: `token ${token}`,
        },
      });
    } catch (error) {
      logger.error('Failed to handle commented review', { error });
      throw error;
    }
  }
}
