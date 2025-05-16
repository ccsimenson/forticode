import { SecurityCheck, SecurityCheckResult, SecurityHeaders, NodeSecurityConfig, ConfigFile, NpmAuditResponse, NvdVulnerability } from './types';
import { VulnerabilityService } from './vulnerability-service';

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export class SecurityHeadersCheck implements SecurityCheck {
    name = 'Security Headers Validation';

    async run(): Promise<SecurityCheckResult> {
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

            const checks = [
                { header: 'X-Content-Type-Options', value: 'nosniff' },
                { header: 'X-Frame-Options', value: 'DENY' },
                { header: 'X-XSS-Protection', value: '1; mode=block' },
                { header: 'Content-Security-Policy', value: headers['Content-Security-Policy'] },
                { header: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { header: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                { header: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
            ];

            const results = checks.map(check => ({
                header: check.header,
                expected: check.value,
                actual: headers[check.header],
                valid: headers[check.header] === check.value
            }));

            const valid = results.every(r => r.valid);
            return {
                name: this.name,
                valid,
                errors: valid ? [] : results.filter(r => !r.valid).map(r => `${r.header} has incorrect value: expected ${r.expected}, got ${r.actual}`),
                configFiles: []
            };
        } catch (error) {
            return {
                name: this.name,
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }
}

export class DependencyCheck implements SecurityCheck {
    name = 'Dependency Vulnerability Scan';
    private vulnerabilityService = VulnerabilityService.getInstance();

    async run(): Promise<SecurityCheckResult> {
        try {
            // Get npm audit vulnerabilities
            const npmAuditResult = await execSync('npm audit --json', { encoding: 'utf-8' });
            const npmAudit: NpmAuditResponse = JSON.parse(npmAuditResult);
            const npmVulnerabilities: NvdVulnerability[] = [];

            if (npmAudit.advisories) {
                Object.values(npmAudit.advisories).forEach(advisory => {
                    const vuln: NvdVulnerability = {
                        id: `npm-${advisory.id}`,
                        name: advisory.module_name,
                        version: advisory.vulnerable_versions,
                        severity: advisory.severity as 'critical' | 'high' | 'medium' | 'low',
                        description: advisory.overview,
                        references: advisory.references || [],
                        published: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        cvssScore: advisory.severity === 'critical' ? 9.0 : advisory.severity === 'high' ? 7.0 : advisory.severity === 'medium' ? 5.0 : 3.0,
                        vectorString: advisory.vector_string || 'N/A',
                        affectedVersions: [advisory.vulnerable_versions]
                    };
                    npmVulnerabilities.push(vuln);
                });
            }

            // Get NVD vulnerabilities
            const packageList = JSON.parse(execSync('npm list --json', { encoding: 'utf-8' })) as { dependencies: Record<string, { version: string }> };
            const dependencies = Object.entries(packageList.dependencies || {}).reduce((acc, [name, info]) => {
                if (info.version) {
                    acc[name] = info.version;
                }
                return acc;
            }, {} as Record<string, string>);

            const nvdVulnerabilities = await this.vulnerabilityService.checkPackageDependenciesVulnerabilities(dependencies);

            // Get Node.js vulnerabilities
            const nodeVulnerabilities = await this.vulnerabilityService.checkNodeVersionVulnerabilities(process.version);

            // Get Electron vulnerabilities
            const electronVulnerabilities = await this.vulnerabilityService.checkElectronVersionVulnerabilities(process.versions.electron);

            // Combine all vulnerabilities and deduplicate
            const allVulnerabilities = [...npmVulnerabilities, ...nvdVulnerabilities, ...nodeVulnerabilities, ...electronVulnerabilities];
            const uniqueVulnerabilities = Array.from(new Map(
                allVulnerabilities.map(vuln => [vuln.id, vuln])
            ).values());

            return {
                name: this.name,
                valid: uniqueVulnerabilities.length === 0,
                errors: uniqueVulnerabilities.map(v => v.description),
                configFiles: []
            };
        } catch (error) {
            console.error('Error scanning dependencies:', error);
            return {
                name: this.name,
                valid: false,
                errors: [error instanceof Error ? error.message : 'Failed to scan dependencies'],
                configFiles: []
            };
        }
    }
}

export class NodeSecurityCheck implements SecurityCheck {
    name = 'Node.js Security Configuration';

    async run(): Promise<SecurityCheckResult> {
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

            const checks = [
                { property: 'strictSSL', expected: true },
                { property: 'enableSourceMaps', expected: true },
                { property: 'enableExperimentalFeatures', expected: false },
                { property: 'maxOldSpaceSize', expected: 4096 },
                { property: 'audit', expected: true }
            ];

            const results = checks.map(check => ({
                property: check.property,
                expected: check.expected,
                actual: securityConfig.security[check.property],
                valid: securityConfig.security[check.property] === check.expected
            }));

            const valid = results.every(r => r.valid);
            return {
                name: this.name,
                valid,
                errors: valid ? [] : results.filter(r => !r.valid).map(r => `${r.property} has incorrect value: expected ${r.expected}, got ${r.actual}`),
                configFiles: []
            };
        } catch (error) {
            console.error('Error checking Node.js configuration:', error);
            return {
                name: this.name,
                valid: false,
                errors: [error instanceof Error ? error.message : 'Failed to check Node.js configuration'],
                configFiles: []
            };
        }
    }
}

export class ElectronSecurityCheck implements SecurityCheck {
    name = 'Electron Security';
    private vulnerabilityService = VulnerabilityService.getInstance();

    async run(): Promise<SecurityCheckResult> {
        try {
            const nodeVersionCheck = await this.checkNodeVersion();
            const electronVersionCheck = await this.checkElectronVersion();
            const packageDependenciesCheck = await this.checkPackageDependencies();

            const valid = nodeVersionCheck.valid && electronVersionCheck.valid && packageDependenciesCheck.valid;
            const errors = [...nodeVersionCheck.errors, ...electronVersionCheck.errors, ...packageDependenciesCheck.errors];

            return {
                name: this.name,
                valid,
                errors,
                configFiles: []
            };
        } catch (error) {
            console.error('Error running security checks:', error);
            return {
                name: this.name,
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }

    private async checkNodeVersion(): Promise<SecurityCheckResult> {
        try {
            const version = process.version;
            const vulnerabilities = await this.vulnerabilityService.checkNodeVersionVulnerabilities(version);
            return {
                name: 'Node.js Version',
                valid: vulnerabilities.length === 0,
                errors: vulnerabilities.map(v => v.description),
                configFiles: []
            };
        } catch (error) {
            console.error('Error checking Node.js version:', error);
            return {
                name: 'Node.js Version',
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }

    private async checkElectronVersion(): Promise<SecurityCheckResult> {
        try {
            const version = process.versions.electron;
            const vulnerabilities = await this.vulnerabilityService.checkElectronVersionVulnerabilities(version);
            return {
                name: 'Electron Version',
                valid: vulnerabilities.length === 0,
                errors: vulnerabilities.map(v => v.description),
                configFiles: []
            };
        } catch (error) {
            console.error('Error checking Electron version:', error);
            return {
                name: 'Electron Version',
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }

    private async checkPackageDependencies(): Promise<SecurityCheckResult> {
        try {
            const result = execSync('npm list --json', { encoding: 'utf-8' });
            const packageList = JSON.parse(result);
            const dependencies: Record<string, string> = {};

            const processDependencies = (deps: Record<string, any>, path: string[] = []): void => {
                for (const [name, info] of Object.entries(deps)) {
                    const currentPath = [...path, name];
                    const version = info.version;
                    if (version) {
                        dependencies[name] = version;
                    }
                    if (info.dependencies) {
                        processDependencies(info.dependencies, currentPath);
                    }
                }
            };

            processDependencies(packageList.dependencies || {});

            const vulnerabilities = await this.vulnerabilityService.checkPackageDependenciesVulnerabilities(dependencies);
            return {
                name: 'Package Dependencies',
                valid: vulnerabilities.length === 0,
                errors: vulnerabilities.map(v => v.description),
                configFiles: []
            };
        } catch (error) {
            console.error('Error checking package dependencies:', error);
            return {
                name: 'Package Dependencies',
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }
}

export class ConfigFileValidationCheck implements SecurityCheck {
    name = 'Configuration File Validation';
    private vulnerabilityService: VulnerabilityService;

    constructor(vulnerabilityService: VulnerabilityService) {
        this.vulnerabilityService = vulnerabilityService;
    }

    async run(): Promise<SecurityCheckResult> {
        try {
            const configFiles: ConfigFile[] = [];
            const paths = ['package.json', 'package-lock.json', 'tsconfig.json', '.env'];

            for (const path of paths) {
                try {
                    const fileContent = readFileSync(path, 'utf-8');
                    if (path.endsWith('.json')) {
                        JSON.parse(fileContent);
                    }
                    configFiles.push({ path, valid: true });
                } catch (error) {
                    configFiles.push({ path, valid: false, errors: [error instanceof Error ? error.message : 'Invalid file format'] });
                }
            }

            const packageDependenciesCheck = await this.checkPackageDependencies();
            configFiles.push({
                path: 'package.json',
                valid: packageDependenciesCheck.valid,
                errors: packageDependenciesCheck.errors
            });

            const invalidFiles = configFiles.filter(f => !f.valid);

            return {
                name: this.name,
                valid: invalidFiles.length === 0,
                errors: invalidFiles.map(f => `Invalid configuration file: ${f.path}`),
                configFiles
            };
        } catch (error) {
            console.error('Error validating configuration files:', error);
            return {
                name: this.name,
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }

    private async checkPackageDependencies(): Promise<SecurityCheckResult> {
        try {
            const result = execSync('npm list --json', { encoding: 'utf-8' });
            const packageList = JSON.parse(result);
            const dependencies: Record<string, string> = {};

            const processDependencies = (deps: Record<string, any>, path: string[] = []): void => {
                for (const [name, info] of Object.entries(deps)) {
                    const currentPath = [...path, name];
                    const version = info.version;
                    if (version) {
                        dependencies[name] = version;
                    }
                    if (info.dependencies) {
                        processDependencies(info.dependencies, currentPath);
                    }
                }
            };

            processDependencies(packageList.dependencies || {});

            const vulnerabilities = await this.vulnerabilityService.checkPackageDependenciesVulnerabilities(dependencies);
            return {
                name: 'Package Dependencies',
                valid: vulnerabilities.length === 0,
                errors: vulnerabilities.map(v => v.description),
                configFiles: []
            };
        } catch (error) {
            console.error('Error checking package dependencies:', error);
            return {
                name: 'Package Dependencies',
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                configFiles: []
            };
        }
    }
}
