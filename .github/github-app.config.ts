import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';
import { logger } from './logger';

// Load configuration from YAML file
const configPath = process.env.GITHUB_APP_CONFIG || '.github/github-app.yml';
const config = yaml.load(readFileSync(configPath, 'utf8')) as {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  SESSION_SECRET: string;
  WEBHOOK_PATH: string;
  WEBHOOK_PORT: number;
};

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
export const GitHubAppConfig = {
  GITHUB_APP_ID: config.GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY: config.GITHUB_APP_PRIVATE_KEY,
  GITHUB_APP_CLIENT_ID: config.GITHUB_APP_CLIENT_ID,
  GITHUB_APP_CLIENT_SECRET: config.GITHUB_APP_CLIENT_SECRET,
  GITHUB_WEBHOOK_SECRET: config.GITHUB_WEBHOOK_SECRET,
  SESSION_SECRET: config.SESSION_SECRET,
  WEBHOOK_PATH: config.WEBHOOK_PATH,
  WEBHOOK_PORT: config.WEBHOOK_PORT
};

// Export webhook configuration
export const WEBHOOK_CONFIG = {
  path: config.WEBHOOK_PATH,
  port: config.WEBHOOK_PORT
  port: config.webhookPort
  path: config.GITHUB_WEBHOOK_PATH,
  port: parseInt(config.GITHUB_WEBHOOK_PORT)
};

export const AUTH_CONFIG = {
  redirectUri: config.GITHUB_AUTH_REDIRECT_URI,
  sessionSecret: config.SESSION_SECRET
};
