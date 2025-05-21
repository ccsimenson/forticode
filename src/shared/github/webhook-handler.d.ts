import { 
  GitHubWebhookPayload, 
  GitHubPullRequestPayload, 
  GitHubPushPayload, 
  GitHubIssuePayload,
  GitHubEventHandlers
} from './types';

declare class WebhookHandler {
  private eventHandlers: GitHubEventHandlers;
  
  /**
   * Register an event handler
   * @param event - The GitHub event name
   * @param handler - The handler function
   */
  on<T extends keyof GitHubEventHandlers>(
    event: T,
    handler: NonNullable<GitHubEventHandlers[T]>
  ): void;

  /**
   * Handle a GitHub webhook event
   * @param event - The GitHub event name
   * @param payload - The webhook payload
   */
  handleEvent(event: string, payload: GitHubWebhookPayload): Promise<void>;

  /**
   * Handle pull request events
   * @param payload - The pull request webhook payload
   */
  handlePullRequest(payload: GitHubPullRequestPayload): Promise<void>;

  /**
   * Handle push events
   * @param payload - The push webhook payload
   */
  handlePush(payload: GitHubPushPayload): Promise<void>;

  /**
   * Handle issue events
   * @param payload - The issue webhook payload
   */
  handleIssue(payload: GitHubIssuePayload): Promise<void>;
}

export declare const webhookHandler: WebhookHandler;

declare function runSecurityChecks(commitSha: string): Promise<Array<{
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
}>>;

declare function generateSecurityReport(checks: Array<{
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
}>): string;

export { runSecurityChecks, generateSecurityReport };

export default WebhookHandler;
