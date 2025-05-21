import { GitHubAppConfig } from './types';

// Default configuration - should be overridden with environment variables in production
// Safely access environment variables with proper type checking
export const GITHUB_APP_CONFIG: GitHubAppConfig = {
  id: parseInt(process.env['GITHUB_APP_ID'] || '0', 10),
  privateKey: process.env['GITHUB_PRIVATE_KEY'] || '',
  webhookSecret: process.env['GITHUB_WEBHOOK_SECRET'] || '',
  clientId: process.env['GITHUB_CLIENT_ID'] || '',
  clientSecret: process.env['GITHUB_CLIENT_SECRET'] || ''
};

// Validate required configuration
const nodeEnv = process.env['NODE_ENV'];
if (!GITHUB_APP_CONFIG.privateKey && nodeEnv === 'production') {
  throw new Error('GitHub private key is required in production');
}
