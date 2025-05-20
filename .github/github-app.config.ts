import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';
import { logger } from './logger';

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
const configPath = process.env.GITHUB_APP_CONFIG || '.github/github-app.yml';
const config = yaml.load(readFileSync(configPath, 'utf8')) as AppConfig;

// Validate configuration
if (!config.GITHUB_APP_ID) {
  logger.error('GitHub App ID is required');
  process.exit(1);
}

if (!config.GITHUB_APP_PRIVATE_KEY) {
  logger.error('GitHub App Private Key is required');
  process.exit(1);
}

if (!config.GITHUB_APP_CLIENT_ID) {
  logger.error('GitHub App Client ID is required');
  process.exit(1);
}

if (!config.GITHUB_APP_CLIENT_SECRET) {
  logger.error('GitHub App Client Secret is required');
  process.exit(1);
}

if (!config.GITHUB_WEBHOOK_SECRET) {
  logger.error('GitHub Webhook Secret is required');
  process.exit(1);
}

if (!config.SESSION_SECRET) {
  logger.error('Session Secret is required');
  process.exit(1);
}

if (!config.WEBHOOK_PATH) {
  logger.error('Webhook Path is required');
  process.exit(1);
}

if (!config.WEBHOOK_PORT) {
  logger.error('Webhook Port is required');
  process.exit(1);
}

// Export configuration
// Define the base URL for webhooks (should be your public URL in production)
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || `http://localhost:${config.WEBHOOK_PORT}`;

export const GitHubAppConfig = {
  ...config,
  // Add any additional configuration options here
  get privateKey() {
    return Buffer.from(config.GITHUB_APP_PRIVATE_KEY, 'base64').toString('utf-8');
  },
  webhookUrl: WEBHOOK_BASE_URL,
  webhookPath: config.WEBHOOK_PATH,
  webhookSecret: config.GITHUB_WEBHOOK_SECRET,
  get fullWebhookUrl() {
    return `${this.webhookUrl}${this.webhookPath}`.replace(/([^:]\/)\/+/g, '$1');
  }
};

// Export webhook configuration
export const webhookConfig = {
  path: config.WEBHOOK_PATH,
  port: config.WEBHOOK_PORT,
  secret: config.GITHUB_WEBHOOK_SECRET,
  // Add any additional webhook configuration here
};

export const authConfig = {
  redirectUri: config.GITHUB_AUTH_REDIRECT_URI,
  sessionSecret: config.SESSION_SECRET
};
