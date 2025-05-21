"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_APP_CONFIG = void 0;
// Default configuration - should be overridden with environment variables in production
// Safely access environment variables with proper type checking
exports.GITHUB_APP_CONFIG = {
    id: parseInt(process.env['GITHUB_APP_ID'] || '0', 10),
    privateKey: process.env['GITHUB_PRIVATE_KEY'] || '',
    webhookSecret: process.env['GITHUB_WEBHOOK_SECRET'] || '',
    clientId: process.env['GITHUB_CLIENT_ID'] || '',
    clientSecret: process.env['GITHUB_CLIENT_SECRET'] || ''
};
// Validate required configuration
const nodeEnv = process.env['NODE_ENV'];
if (!exports.GITHUB_APP_CONFIG.privateKey && nodeEnv === 'production') {
    throw new Error('GitHub private key is required in production');
}
//# sourceMappingURL=config.js.map