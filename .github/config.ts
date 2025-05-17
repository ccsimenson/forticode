import yaml from 'yaml';
import fs from 'fs';
import path from 'path';

// Load configuration from YAML file
const configPath = path.join(process.cwd(), '.env.yaml');
const env = yaml.parse(fs.readFileSync(configPath, 'utf-8')) as {
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_CLIENT_ID: string;
  GITHUB_APP_CLIENT_SECRET: string;
  GITHUB_AUTH_REDIRECT_URI: string;
  GITHUB_WEBHOOK_PATH: string;
  GITHUB_WEBHOOK_PORT: string;
  GITHUB_APP_WEBHOOK_SECRET: string;
};

// Webhook configuration
export const WEBHOOK_CONFIG = {
  path: env.GITHUB_WEBHOOK_PATH,
  port: parseInt(env.GITHUB_WEBHOOK_PORT, 10),
  webhookSecret: env.GITHUB_APP_WEBHOOK_SECRET
};
