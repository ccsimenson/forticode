import { ipcRenderer } from 'electron';
import { SecurityCheck, SecurityScanResult, Vulnerability, SecurityHeaders, NodeSecurityConfig, ElectronSecurityConfig, ConfigFile } from './types.js';

export class SecurityScanner {
    private static instance: SecurityScanner;
    private checks: SecurityCheck[];

    private constructor() {
        this.checks = [
            this.createSecurityHeadersCheck(),
            this.createDependencyCheck(),
            this.createNodeSecurityCheck(),
            this.createElectronSecurityCheck(),
            this.createConfigValidationCheck()
        ];
    }

    public static getInstance(): SecurityScanner {
        if (!SecurityScanner.instance) {
            SecurityScanner.instance = new SecurityScanner();
        }
        return SecurityScanner.instance;
    }

    public async runFullScan(): Promise<SecurityScanResult> {
        const results: SecurityScanResult = {
            timestamp: new Date(),
            checks: []
        };

        for (const check of this.checks) {
            try {
                const result = await check.run();
                results.checks.push({
                    name: check.name,
                    result,
                    status: result.passed ? 'PASS' : 'FAIL'
                });
            } catch (error) {
                results.checks.push({
                    name: check.name,
                    result: {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    },
                    status: 'ERROR'
                });
            }
        }

        return results;
    }

    private createSecurityHeadersCheck(): SecurityCheck {
        return {
            name: 'Security Headers Validation',
            run: async () => {
                try {
                    const headers: SecurityHeaders = await ipcRenderer.invoke('get-security-headers');
                    const checks = {
                        'X-Content-Type-Options': headers['X-Content-Type-Options'] === 'nosniff',
                        'X-Frame-Options': headers['X-Frame-Options'] === 'DENY' || headers['X-Frame-Options'] === 'SAMEORIGIN',
                        'X-XSS-Protection': headers['X-XSS-Protection'] === '1; mode=block',
                        'Content-Security-Policy': !!headers['Content-Security-Policy']
                    };
                    
                    return {
                        passed: Object.values(checks).every(Boolean),
                        details: checks
                    };
                } catch (error) {
                    return {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    };
                }
            }
        };
    }

    private createDependencyCheck(): SecurityCheck {
        return {
            name: 'Dependency Vulnerability Scan',
            run: async () => {
                try {
                    const vulnerabilities: Vulnerability[] = await ipcRenderer.invoke('scan-dependencies');
                    return {
                        passed: vulnerabilities.length === 0,
                        details: {
                            totalDependencies: vulnerabilities.length,
                            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                            high: vulnerabilities.filter(v => v.severity === 'high').length,
                            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
                            low: vulnerabilities.filter(v => v.severity === 'low').length,
                            vulnerabilities
                        }
                    };
                } catch (error) {
                    return {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    };
                }
            }
        };
    }

    private createNodeSecurityCheck(): SecurityCheck {
        return {
            name: 'Node.js Security Best Practices',
            run: async () => {
                try {
                    const nodeConfig: NodeSecurityConfig = await ipcRenderer.invoke('get-node-config');
                    return {
                        passed: this.validateNodeSecurity(nodeConfig),
                        details: {
                            nodeVersion: nodeConfig.version,
                            securitySettings: nodeConfig.security,
                            auditEnabled: nodeConfig.audit
                        }
                    };
                } catch (error) {
                    return {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    };
                }
            }
        };
    }

    private createElectronSecurityCheck(): SecurityCheck {
        return {
            name: 'Electron Security Configuration',
            run: async () => {
                try {
                    const electronConfig: ElectronSecurityConfig = await ipcRenderer.invoke('get-electron-config');
                    return {
                        passed: this.validateElectronSecurity(electronConfig),
                        details: {
                            contextIsolation: electronConfig.contextIsolation,
                            nodeIntegration: electronConfig.nodeIntegration,
                            sandbox: electronConfig.sandbox
                        }
                    };
                } catch (error) {
                    return {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    };
                }
            }
        };
    }

    private createConfigValidationCheck(): SecurityCheck {
        return {
            name: 'Configuration File Validation',
            run: async () => {
                try {
                    const configFiles: ConfigFile[] = await ipcRenderer.invoke('get-config-files');
                    const validFiles = configFiles.filter(file => file.valid);
                    const invalidFiles = configFiles.filter(file => !file.valid);
                    
                    return {
                        passed: invalidFiles.length === 0,
                        details: {
                            validFiles: validFiles.map(file => file.path),
                            invalidFiles: invalidFiles.map(file => ({
                                path: file.path,
                                errors: file.errors
                            }))
                        }
                    };
                } catch (error) {
                    return {
                        passed: false,
                        details: { error: error instanceof Error ? error.message : 'Unknown error' }
                    };
                }
            }
        };
    }

    private validateNodeSecurity(config: NodeSecurityConfig): boolean {
        return config.version.startsWith('18.') &&
               config.security?.strictSSL === true &&
               config.audit === true;
    }

    private validateElectronSecurity(config: ElectronSecurityConfig): boolean {
        return config.contextIsolation === true &&
               config.nodeIntegration === false &&
               config.sandbox === true;
    }
}
