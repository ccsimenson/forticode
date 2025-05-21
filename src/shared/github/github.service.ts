import { webhookHandler, WebhookHandler } from './webhook-handler';
import type { 
  GitHubWebhookPayload,
  GitHubFileContent
} from './types';

// Simple console-based logger to avoid import issues
const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: unknown[]) => console.debug(`[DEBUG] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[WARN] ${message}`, ...args)
};

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
export class GitHubService {
  private token: string | null;
  private webhookHandler: WebhookHandler;
  private baseUrl: string;

  /**
   * Create a new GitHub service instance
   * @param token - Optional GitHub personal access token for API authentication
   */
  constructor(token: string | null = null) {
    this.token = token;
    this.baseUrl = 'https://api.github.com';
    this.webhookHandler = webhookHandler;
  }

  /**
   * Make an authenticated request to the GitHub API
   * @param endpoint - The API endpoint (e.g., '/repos/owner/repo')
   * @param options - Fetch options
   * @returns A promise that resolves to the response data
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/vnd.github.v3+json');
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `token ${this.token}`);
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };
    
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        const errorMessage = `GitHub API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // For 204 No Content responses, return null
      if (response.status === 204) {
        return null as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      logger.error('GitHub API request failed', error);
      throw error;
    }
  }

  /**
   * Get repository contents
   * @param options - Repository and path options
   * @returns A promise that resolves to the repository contents
   */
  async getContents(options: GitHubServiceOptions): Promise<GitHubFileContent | GitHubFileContent[]> {
    const { owner, repo, path = '', ref = 'main' } = options;
    const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    return this.request<GitHubFileContent | GitHubFileContent[]>(endpoint);
  }

  /**
   * Get file content from a repository
   * @param options - Repository and file options
   * @returns A promise that resolves to the file content as a string
   */
  async getFileContent(options: GitHubServiceOptions): Promise<string> {
    const { owner, repo, path, ref } = options;
    
    if (!path) {
      throw new Error('Path is required for getFileContent');
    }

    const endpoint = `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}` 
      + (ref ? `?ref=${encodeURIComponent(ref)}` : '');

    const response = await this.request<GitHubFileContent>(endpoint);
    
    if (response.content) {
      // GitHub returns base64 encoded content
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    
    throw new Error('Content not found in response');
  }

  /**
   * Handle a GitHub webhook event
   * @param event - The GitHub event name
   * @param payload - The webhook payload
   */
  async handleWebhookEvent(event: string, payload: GitHubWebhookPayload): Promise<void> {
    try {
      logger.info(`Processing ${event} event`);
      await this.webhookHandler.handleEvent(event, payload);
    } catch (error) {
      logger.error(`Error handling ${event} event:`, error);
      throw error;
    }
  }
}

// Export the service
export default GitHubService;
