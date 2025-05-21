"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = void 0;
const electron_1 = require("electron");
class SecurityScanner {
    createErrorResult(checkName, error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            name: checkName,
            valid: false,
            errors: [errorMessage],
            details: { error: errorMessage }
        };
    }
    createSuccessResult(checkName, details = {}, errors = []) {
        return {
            name: checkName,
            valid: true,
            errors,
            details
        };
    }
    createFailureResult(checkName, details = {}, errors = ['Check failed']) {
        return {
            name: checkName,
            valid: false,
            errors,
            details
        };
    }
    constructor() {
        this.checks = [
            this.createSecurityHeadersCheck(),
            this.createDependencyCheck(),
            this.createNodeSecurityCheck(),
            this.createElectronSecurityCheck(),
            this.createConfigValidationCheck()
        ];
    }
    static getInstance() {
        if (!SecurityScanner.instance) {
            SecurityScanner.instance = new SecurityScanner();
        }
        return SecurityScanner.instance;
    }
    async runFullScan() {
        const results = {
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
            }
            catch (error) {
                results.checks.push({
                    name: check.name,
                    result: this.createErrorResult(check.name, error),
                    status: 'ERROR'
                });
            }
        }
        return results;
    }
    createSecurityHeadersCheck() {
        const checkName = 'Security Headers Validation';
        return {
            name: checkName,
            run: async () => {
                try {
                    const headers = await electron_1.ipcRenderer.invoke('get-security-headers');
                    const checks = {
                        'X-Content-Type-Options': headers['X-Content-Type-Options'] === 'nosniff',
                        'X-Frame-Options': headers['X-Frame-Options'] === 'DENY' || headers['X-Frame-Options'] === 'SAMEORIGIN',
                        'X-XSS-Protection': headers['X-XSS-Protection'] === '1; mode=block',
                        'Content-Security-Policy': !!headers['Content-Security-Policy']
                    };
                    const allValid = Object.values(checks).every(Boolean);
                    if (allValid) {
                        return this.createSuccessResult(checkName, { checks });
                    }
                    else {
                        return this.createFailureResult(checkName, { checks }, ['Some security headers are missing or misconfigured']);
                    }
                }
                catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }
    createDependencyCheck() {
        const checkName = 'Dependency Vulnerability Scan';
        return {
            name: checkName,
            run: async () => {
                try {
                    const vulnerabilities = await electron_1.ipcRenderer.invoke('scan-dependencies');
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
                        return this.createFailureResult(checkName, details, ['Vulnerable dependencies found']);
                    }
                    else {
                        return this.createSuccessResult(checkName, details);
                    }
                }
                catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }
    createNodeSecurityCheck() {
        const checkName = 'Node.js Security Best Practices';
        return {
            name: checkName,
            run: async () => {
                try {
                    const nodeConfig = await electron_1.ipcRenderer.invoke('get-node-config');
                    const isValid = this.validateNodeSecurity(nodeConfig);
                    const details = {
                        nodeVersion: nodeConfig.version,
                        securitySettings: nodeConfig.security,
                        auditEnabled: nodeConfig.audit
                    };
                    if (isValid) {
                        return this.createSuccessResult(checkName, details);
                    }
                    else {
                        return this.createFailureResult(checkName, details, ['Node.js security configuration is not optimal']);
                    }
                }
                catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }
    createElectronSecurityCheck() {
        const checkName = 'Electron Security Configuration';
        return {
            name: checkName,
            run: async () => {
                try {
                    const electronConfig = await electron_1.ipcRenderer.invoke('get-electron-config');
                    const isValid = this.validateElectronSecurity(electronConfig);
                    const details = {
                        contextIsolation: electronConfig.contextIsolation,
                        nodeIntegration: electronConfig.nodeIntegration,
                        sandbox: electronConfig.sandbox
                    };
                    if (isValid) {
                        return this.createSuccessResult(checkName, details);
                    }
                    else {
                        return this.createFailureResult(checkName, details, ['Electron security configuration is not optimal']);
                    }
                }
                catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }
    createConfigValidationCheck() {
        const checkName = 'Configuration File Validation';
        return {
            name: checkName,
            run: async () => {
                try {
                    const configFiles = await electron_1.ipcRenderer.invoke('get-config-files');
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
                    }
                    else {
                        return this.createFailureResult(checkName, details, ['Some configuration files are invalid']);
                    }
                }
                catch (error) {
                    return this.createErrorResult(checkName, error);
                }
            }
        };
    }
    validateNodeSecurity(config) {
        return config.version.startsWith('18.') &&
            config.security?.strictSSL === true &&
            config.audit === true;
    }
    validateElectronSecurity(config) {
        return config.contextIsolation === true &&
            config.nodeIntegration === false &&
            config.sandbox === true;
    }
}
exports.SecurityScanner = SecurityScanner;
//# sourceMappingURL=security-scanner.js.map