import { GitHubWebhookPayload, GitHubPullRequestPayload, GitHubPushPayload, GitHubIssuePayload, GitHubEventHandlers } from './types';
/**
 * Handles incoming GitHub webhook events
 */
export declare class WebhookHandler {
    private eventHandlers;
    /**
     * Register an event handler
     * @param event - The GitHub event name
     * @param handler - The handler function
     */
    on<T extends keyof GitHubEventHandlers>(event: T, handler: NonNullable<GitHubEventHandlers[T]>): void;
    /**
     * Handle a GitHub webhook event
     * @param event - The GitHub event name (e.g., 'pull_request', 'push', 'issues')
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
/**
 * Runs security checks on the given commit SHA
 * @param _commitSha - The commit SHA to check (currently unused)
 * @returns A promise that resolves to an array of security issues
 */
declare function runSecurityChecks(_commitSha: string): Promise<Array<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    file?: string;
    line?: number;
}>>;
/**
 * Generates a markdown report from security check results
 * @param checks - Array of security check results
 * @returns A markdown formatted report string
 */
declare function generateSecurityReport(checks: Array<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    file?: string;
    line?: number;
}>): string;
export { runSecurityChecks, generateSecurityReport };
//# sourceMappingURL=webhook-handler.d.ts.map