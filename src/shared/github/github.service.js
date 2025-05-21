"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const webhook_handler_1 = require("./webhook-handler");
// Simple console-based logger to avoid import issues
const logger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args)
};
/**
 * Service for interacting with GitHub API and handling webhook events
 */
class GitHubService {
    /**
     * Create a new GitHub service instance
     * @param token - Optional GitHub personal access token for API authentication
     */
    constructor(token = null) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.webhookHandler = webhook_handler_1.webhookHandler;
    }
    /**
     * Make an authenticated request to the GitHub API
     * @param endpoint - The API endpoint (e.g., '/repos/owner/repo')
     * @param options - Fetch options
     * @returns A promise that resolves to the response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = new Headers(options.headers);
        headers.set('Accept', 'application/vnd.github.v3+json');
        headers.set('Content-Type', 'application/json');
        if (this.token) {
            headers.set('Authorization', `token ${this.token}`);
        }
        const config = {
            ...options,
            headers,
        };
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({})));
                const errorMessage = `GitHub API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`;
                logger.error(errorMessage);
                throw new Error(errorMessage);
            }
            // For 204 No Content responses, return null
            if (response.status === 204) {
                return null;
            }
            return (await response.json());
        }
        catch (error) {
            logger.error('GitHub API request failed', error);
            throw error;
        }
    }
    /**
     * Get repository contents
     * @param options - Repository and path options
     * @returns A promise that resolves to the repository contents
     */
    async getContents(options) {
        const { owner, repo, path = '', ref = 'main' } = options;
        const endpoint = `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
        return this.request(endpoint);
    }
    /**
     * Get file content from a repository
     * @param options - Repository and file options
     * @returns A promise that resolves to the file content as a string
     */
    async getFileContent(options) {
        const { owner, repo, path, ref } = options;
        if (!path) {
            throw new Error('Path is required for getFileContent');
        }
        const endpoint = `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`
            + (ref ? `?ref=${encodeURIComponent(ref)}` : '');
        const response = await this.request(endpoint);
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
    async handleWebhookEvent(event, payload) {
        try {
            logger.info(`Processing ${event} event`);
            await this.webhookHandler.handleEvent(event, payload);
        }
        catch (error) {
            logger.error(`Error handling ${event} event:`, error);
            throw error;
        }
    }
}
exports.GitHubService = GitHubService;
// Export the service
exports.default = GitHubService;
//# sourceMappingURL=github.service.js.map