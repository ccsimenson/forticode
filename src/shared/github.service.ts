import logger from '@renderer/utils/logger';

// Define types for GitHub API responses
export interface GitHubFileContent {
  content: string;
  encoding: string;
  sha: string;
  size: number;
  url: string;
  path: string;
  name: string;
}

export interface GitHubFileInfo {
  type: string;
  size: number;
  name: string;
  path: string;
  content?: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string | null;
}

interface GithubServiceOptions {
  owner: string;
  repo: string;
  path?: string;
  ref?: string;
}

class GithubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `GitHub API request failed with status ${response.status}: ${errorData.message || 'Unknown error'}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      logger.error('GitHub API request failed', error);
      throw error;
    }
  }

  async getContents(options: GithubServiceOptions): Promise<any> {
    const { owner, repo, path = '', ref = 'main' } = options;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
    return this.request(url);
  }

  async getFileContent(options: GithubServiceOptions): Promise<string> {
    const { owner, repo, path, ref } = options;
    if (!path) {
      throw new Error('Path is required for getFileContent');
    }

    let url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    if (ref) {
      url += `?ref=${encodeURIComponent(ref)}`;
    }

    const response = await this.request<GitHubFileContent>(url);
    
    if (response.content) {
      // GitHub returns base64 encoded content
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    
    throw new Error('Content not found in response');
  }
}

export default GithubService;
export type { GithubServiceOptions };
