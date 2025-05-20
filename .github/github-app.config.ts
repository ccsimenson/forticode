import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';
import { logger } from './logger';
import { Octokit } from '@octokit/rest';

// Define configuration interface
interface AppConfig {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  SESSION_SECRET: string;
  WEBHOOK_PATH: string;
  WEBHOOK_PORT: number;
  GITHUB_AUTH_REDIRECT_URI?: string;
  NODE_ENV?: string;
}

// Load configuration from YAML file
const yamlConfigPath = process.env.GITHUB_APP_CONFIG || '.github/github-app.yml';
const yamlConfig = yaml.load(readFileSync(yamlConfigPath, 'utf8')) as AppConfig;

// Validate configuration
if (!yamlConfig.GITHUB_APP_ID) {
  logger.error('GitHub App ID is required');
  process.exit(1);
}

if (!yamlConfig.GITHUB_APP_PRIVATE_KEY) {
  logger.error('GitHub App Private Key is required');
  process.exit(1);
}

if (!yamlConfig.GITHUB_APP_CLIENT_ID) {
  logger.error('GitHub App Client ID is required');
  process.exit(1);
}

if (!yamlConfig.GITHUB_APP_CLIENT_SECRET) {
  logger.error('GitHub App Client Secret is required');
  process.exit(1);
}

if (!yamlConfig.GITHUB_WEBHOOK_SECRET) {
  logger.error('GitHub Webhook Secret is required');
  process.exit(1);
}

if (!yamlConfig.SESSION_SECRET) {
  logger.error('Session Secret is required');
  process.exit(1);
}

if (!yamlConfig.WEBHOOK_PATH) {
  logger.error('Webhook Path is required');
  process.exit(1);
}

if (!yamlConfig.WEBHOOK_PORT) {
  logger.error('Webhook Port is required');
  process.exit(1);
}

// Define the base URL for webhooks (should be your public URL in production)
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || `http://localhost:${yamlConfig.WEBHOOK_PORT}`;

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  webhookUrl: string;
  owner: string;
  repo: string;
  octokit: Octokit;
  webhookPath: string;
  webhookPort: number;
  GITHUB_AUTH_REDIRECT_URI?: string;
  SESSION_SECRET: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  NODE_ENV?: string;
}

export const config: GitHubAppConfig = {
  appId: process.env.GITHUB_APP_ID || yamlConfig.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY || Buffer.from(yamlConfig.GITHUB_APP_PRIVATE_KEY, 'base64').toString('utf-8'),
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || yamlConfig.GITHUB_WEBHOOK_SECRET,
  webhookUrl: process.env.GITHUB_WEBHOOK_URL || WEBHOOK_BASE_URL,
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
  webhookPath: process.env.WEBHOOK_PATH || yamlConfig.WEBHOOK_PATH,
  webhookPort: parseInt(process.env.WEBHOOK_PORT || yamlConfig.WEBHOOK_PORT.toString()),
  octokit: new Octokit({
    auth: process.env.GITHUB_TOKEN,
  }),
  SESSION_SECRET: process.env.SESSION_SECRET || yamlConfig.SESSION_SECRET,
  GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID || yamlConfig.GITHUB_APP_CLIENT_ID,
  GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET || yamlConfig.GITHUB_APP_CLIENT_SECRET,
  GITHUB_AUTH_REDIRECT_URI: process.env.GITHUB_AUTH_REDIRECT_URI || yamlConfig.GITHUB_AUTH_REDIRECT_URI,
  NODE_ENV: process.env.NODE_ENV || yamlConfig.NODE_ENV,
};

// Export webhook configuration
export const webhookConfig = {
  path: config.webhookPath,
  port: config.webhookPort,
  secret: config.webhookSecret,
  // Add any additional webhook configuration here
};

export const authConfig = {
  redirectUri: config.GITHUB_AUTH_REDIRECT_URI,
  sessionSecret: config.SESSION_SECRET
};
