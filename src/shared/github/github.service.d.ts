import type { GitHubWebhookPayload, GitHubFileContent } from './types';
/**
 * Options for GitHub service methods
 */
export interface GitHubServiceOptions {
    owner: string;
    repo: string;
    path?: string;
    ref?: string;
}
/**
 * Service for interacting with GitHub API and handling webhook events
 */
export declare class GitHubService {
    private token;
    private webhookHandler;
    private baseUrl;
    /**
     * Create a new GitHub service instance
     * @param token - Optional GitHub personal access token for API authentication
     */
    constructor(token?: string | null);
    /**
     * Make an authenticated request to the GitHub API
     * @param endpoint - The API endpoint (e.g., '/repos/owner/repo')
     * @param options - Fetch options
     * @returns A promise that resolves to the response data
     */
    private request;
    /**
     * Get repository contents
     * @param options - Repository and path options
     * @returns A promise that resolves to the repository contents
     */
    getContents(options: GitHubServiceOptions): Promise<GitHubFileContent | GitHubFileContent[]>;
    /**
     * Get file content from a repository
     * @param options - Repository and file options
     * @returns A promise that resolves to the file content as a string
     */
    getFileContent(options: GitHubServiceOptions): Promise<string>;
    /**
     * Handle a GitHub webhook event
     * @param event - The GitHub event name
     * @param payload - The webhook payload
     */
    handleWebhookEvent(event: string, payload: GitHubWebhookPayload): Promise<void>;
}
export default GitHubService;
//# sourceMappingURL=github.service.d.ts.map