import { ipcRenderer } from 'electron';
import { SecurityCheck, SecurityScanResult, NvdVulnerability as Vulnerability, SecurityHeaders, NodeSecurityConfig, ElectronSecurityConfig, ConfigFile, SecurityCheckResult } from './types';

class SecurityScanner {
    private static instance: SecurityScanner;
    private checks: SecurityCheck[];

    private createErrorResult(checkName: string, error: unknown): SecurityCheckResult {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            name: checkName,
            valid: false,
            errors: [errorMessage],
            details: { error: errorMessage }
        };
    }

    private createSuccessResult(checkName: string, details: any = {}, errors: string[] = []): SecurityCheckResult {
        return {
            name: checkName,
            valid: true,
            errors,
            details
        };
    }

    private createFailureResult(checkName: string, details: any = {}, errors: string[] = ['Check failed']): SecurityCheckResult {
        return {
            name: checkName,
            valid: false,
            errors,
            details
        };
    }

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
                    status: result.valid ? 'PASS' : 'FAIL'
                });
            } catch (error) {
                results.checks.push({
                    name: check.name,
                    result: this.createErrorResult(check.name, error),
                    status: 'ERROR'
                });
            }
        }

        return results;
    }

    private createSecurityHeadersCheck(): SecurityCheck {
        const checkName = 'Security Headers Validation';
        return {
            name: checkName,
            run: async (): Promise<SecurityCheckResult> => {
                try {
                    const headers: SecurityHeaders = await ipcRenderer.invoke('get-security-headers');
                    const checks = {
                        'X-Content-Type-Options': headers['X-Content-Type-Options'] === 'nosniff',
                        'X-Frame-Options': headers['X-Frame-Options'] === 'DENY' || headers['X-Frame-Options'] === 'SAMEORIGIN',
                        'X-XSS-Protection': headers['X-XSS-Protection'] === '1; mode=block',
                        'Content-Security-Policy': !!headers['Content-Security-Policy']
                    };
                    
                    const allValid = Object.values(checks).every(Boolean);
                    if (allValid) {
                        return this.createSuccessResult(checkName, { checks });
                    } else {
                        return this.createFailureResult(
                            checkName, 
                            { checks },
                            ['Some security headers are missing or misconfigured']
                        );
                    }
                } catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }

    private createDependencyCheck(): SecurityCheck {
        const checkName = 'Dependency Vulnerability Scan';
        return {
            name: checkName,
            run: async (): Promise<SecurityCheckResult> => {
                try {
                    const vulnerabilities: Vulnerability[] = await ipcRenderer.invoke('scan-dependencies');
                    const hasVulnerabilities = vulnerabilities.length > 0;
                    const details = {
                        totalDependencies: vulnerabilities.length,
                        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                        high: vulnerabilities.filter(v => v.severity === 'high').length,
                        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
                        low: vulnerabilities.filter(v => v.severity === 'low').length,
                        vulnerabilities
                    };

                    if (hasVulnerabilities) {
                        return this.createFailureResult(
                            checkName,
                            details,
                            ['Vulnerable dependencies found']
                        );
                    } else {
                        return this.createSuccessResult(checkName, details);
                    }
                } catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }

    private createNodeSecurityCheck(): SecurityCheck {
        const checkName = 'Node.js Security Best Practices';
        return {
            name: checkName,
            run: async (): Promise<SecurityCheckResult> => {
                try {
                    const nodeConfig: NodeSecurityConfig = await ipcRenderer.invoke('get-node-config');
                    const isValid = this.validateNodeSecurity(nodeConfig);
                    const details = {
                        nodeVersion: nodeConfig.version,
                        securitySettings: nodeConfig.security,
                        auditEnabled: nodeConfig.audit
                    };

                    if (isValid) {
                        return this.createSuccessResult(checkName, details);
                    } else {
                        return this.createFailureResult(
                            checkName,
                            details,
                            ['Node.js security configuration is not optimal']
                        );
                    }
                } catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }

    private createElectronSecurityCheck(): SecurityCheck {
        const checkName = 'Electron Security Configuration';
        return {
            name: checkName,
            run: async (): Promise<SecurityCheckResult> => {
                try {
                    const electronConfig: ElectronSecurityConfig = await ipcRenderer.invoke('get-electron-config');
                    const isValid = this.validateElectronSecurity(electronConfig);
                    const details = {
                        contextIsolation: electronConfig.contextIsolation,
                        nodeIntegration: electronConfig.nodeIntegration,
                        sandbox: electronConfig.sandbox
                    };

                    if (isValid) {
                        return this.createSuccessResult(checkName, details);
                    } else {
                        return this.createFailureResult(
                            checkName,
                            details,
                            ['Electron security configuration is not optimal']
                        );
                    }
                } catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }

    private createConfigValidationCheck(): SecurityCheck {
        const checkName = 'Configuration File Validation';
        return {
            name: checkName,
            run: async (): Promise<SecurityCheckResult> => {
                try {
                    const configFiles: ConfigFile[] = await ipcRenderer.invoke('get-config-files');
                    const validFiles = configFiles.filter(file => file.valid);
                    const invalidFiles = configFiles.filter(file => !file.valid);
                    
                    const allValid = invalidFiles.length === 0;
                    const details = {
                        validFiles: validFiles.map(file => file.path),
                        invalidFiles: invalidFiles.map(file => ({
                            path: file.path,
                            errors: file.errors || []
                        }))
                    };

                    if (allValid) {
                        return this.createSuccessResult(checkName, details);
                    } else {
                        return this.createFailureResult(
                            checkName,
                            details,
                            ['Some configuration files are invalid']
                        );
                    }
                } catch (error) {
                    return this.createErrorResult(checkName, error);
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

export default SecurityScanner;
