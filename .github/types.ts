import { WebhookEvent } from '@octokit/webhooks';

export interface GitHubAppConfig {
  id: number;
  privateKey: string;
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: {
    login: string;
    id: number;
  };
  htmlUrl: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  base: {
    ref: string;
    repo: GitHubRepository;
  };
  head: {
    ref: string;
    repo: GitHubRepository;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  repositoryUrl: string;
}

export type GitHubEvent = WebhookEvent<
  | 'push'
  | 'pull_request'
  | 'pull_request_review'
  | 'issues'
  | 'installation'
  | 'installation_repositories'
>;

export interface GitHubSecurityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  files: string[];
  lines: number[];
  fixable: boolean;
  fix?: string;
}
