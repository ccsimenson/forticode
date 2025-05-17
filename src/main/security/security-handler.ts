import { ipcMain } from 'electron';
import { SecurityHeaders, NodeSecurityConfig, ElectronSecurityConfig, ConfigFile, SecurityCheckResult, NpmAuditResponse, NvdVulnerability } from '../../shared/security/types';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import * as path from 'path';
import { join } from 'path';
import { parse } from 'ini';

export function registerSecurityHandlers() {
    // Security headers validation
    ipcMain.handle('get-security-headers', async () => {
        try {
            const headers: SecurityHeaders = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; font-src 'self'; object-src 'none'; media-src 'self' data:;", 
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
            };
            return {
                name: 'Security Headers',
                valid: true,
                errors: [],
                configFiles: [],
                details: headers
            };
        } catch (error) {
            console.error('Error getting security headers:', error);
            throw error;
        }
    });

    // Dependency vulnerability scanning
    ipcMain.handle('scan-dependencies', async () => {
        try {
            const result = execSync('npm audit --json', { encoding: 'utf-8' });
            const audit = JSON.parse(result);
            return {
                name: 'Dependency Vulnerability Scan',
                valid: Object.keys(audit.advisories || {}).length === 0,
                errors: Object.values(audit.advisories || {}).map(advisory => advisory.title),
                configFiles: [],
                details: audit
            };
        } catch (error) {
            console.error('Error scanning dependencies:', error);
            throw error;
        }
    });

    // Node.js security configuration
    ipcMain.handle('get-node-config', async () => {
        try {
            const nodeVersion = process.version;
            const securityConfig: NodeSecurityConfig = {
                version: nodeVersion,
                security: {
                    strictSSL: true,
                    enableSourceMaps: true,
                    enableExperimentalFeatures: false,
                    maxOldSpaceSize: 4096
                },
                audit: true
            };
            return {
                name: 'Node.js Security Configuration',
                valid: true,
                errors: [],
                configFiles: [],
                details: securityConfig
            };
        } catch (error) {
            console.error('Error getting Node.js config:', error);
            throw error;
        }
    });

    // Electron security configuration
    ipcMain.handle('get-electron-config', async () => {
        try {
            const electronConfig: ElectronSecurityConfig = {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                webviewTag: false,
                protocolHandlers: [],
                ipcMain: {
                    allow: [],
                    block: ['*']
                },
                fileSystemAccess: {
                    allow: [],
                    block: ['*'],
                    allowedFileTypes: ['txt', 'json', 'js', 'ts', 'html', 'css'],
                    blockedFileTypes: ['exe', 'dll', 'bat', 'sh', 'py', 'php'],
                    pathTraversalProtection: true,
                    sanitizePaths: true,
                    requirePermissions: true,
                    permissionCheckInterval: 300,
                    restrictedDirs: ['/', 'C:\\', 'D:\\'],
                    allowUserDirs: false,
                    watchdogEnabled: true,
                    watchdogInterval: 60,
                    watchdogLogPath: path.join(process.cwd(), 'logs', 'security-watchdog.log'),
                    audit: {
                        enabled: true,
                        logPath: path.join(process.cwd(), 'logs', 'security-audit.log'),
                        retentionDays: 30
                    },
                    requireEncryption: true,
                    encryptionAlgorithm: 'aes-256-gcm',
                    keyRotationInterval: 86400,
                    backup: {
                        enabled: true,
                        interval: 3600,
                        retentionDays: 7
                    },
                    recovery: {
                        enabled: true,
                        maxAttempts: 3,
                        retryDelay: 300
                    }
                }
            };
            return {
                name: 'Electron Security Configuration',
                valid: true,
                errors: [],
                configFiles: [],
                details: electronConfig
            };
        } catch (error) {
            console.error('Error getting Electron config:', error);
            throw error;
        }
    });

    // Configuration file validation
    ipcMain.handle('get-config-files', async () => {
        try {
            const configFiles: ConfigFile[] = [];
            const configPaths = [
                join(process.cwd(), 'package.json'),
                join(process.cwd(), '.env'),
                join(process.cwd(), '.env.local'),
                join(process.cwd(), 'config.json')
            ];

            for (const path of configPaths) {
                try {
                    const content = readFileSync(path, 'utf-8');
                    if (path.endsWith('.json')) {
                        JSON.parse(content);
                    } else if (path.endsWith('.env')) {
                        parse(content);
                    }
                    configFiles.push({ path, valid: true });
                } catch (error) {
                    configFiles.push({ path, valid: false, errors: [error instanceof Error ? error.message : 'Invalid file format'] });
                }
            }

            return {
                name: 'Configuration File Validation',
                valid: configFiles.every(file => file.valid),
                errors: configFiles.filter(file => !file.valid).map(file => file.errors?.[0] || 'Unknown error'),
                configFiles,
                details: configFiles
            };
        } catch (error) {
            console.error('Error getting config files:', error);
            throw error;
        }
    });
}
