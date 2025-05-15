import { ipcMain } from 'electron';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'ini';
import type { SecurityHeaders, NodeSecurityConfig, ElectronSecurityConfig, ConfigFile } from '../../shared/security/types';

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
            return headers;
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
            return audit.advisories ? Object.values(audit.advisories) : [];
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
            return securityConfig;
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
                webviewTag: false
            };
            return electronConfig;
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

            return configFiles;
        } catch (error) {
            console.error('Error getting config files:', error);
            throw error;
        }
    });
}
