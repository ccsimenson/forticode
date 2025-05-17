export interface ConfigFile {
    path: string;
    valid: boolean;
    errors?: string[];
}

export interface SecurityCheck {
    name: string;
    run(): Promise<SecurityCheckResult>;
}

export interface SecurityCheckResult {
    name: string;
    valid: boolean;
    errors: string[];
    configFiles?: ConfigFile[];
    details?: any;
}

export interface SecurityScanResult {
    timestamp: Date;
    checks: Array<{
        name: string;
        result: SecurityCheckResult;
        status: 'PASS' | 'FAIL' | 'ERROR';
    }>;
}

export interface NvdVulnerability {
    id: string;
    name: string;
    version: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    references: string[];
    published: string;
    lastModified: string;
    cvssScore: number;
    vectorString: string;
    affectedVersions: string[];
    path?: string;
}

export interface CheckResult {
    check: string;
    result: 'PASS' | 'FAIL' | 'ERROR';
    details: {
        version?: string;
        vulnerabilities?: Array<{
            id: string;
            severity: string;
            description: string;
            cvssScore: number;
        }>;
        errors?: string[];
    };
}

export interface NpmAuditAdvisory {
    id: string;
    title: string;
    module_name: string;
    vulnerable_versions: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    overview: string;
    references: string[];
    url?: string;
    cvss_score?: number;
    vector_string?: string;
}

export interface NpmAuditResponse {
    advisories: Record<string, NpmAuditAdvisory>;
    metadata: {
        vulnerabilities: {
            info: number;
            low: number;
            moderate: number;
            high: number;
            critical: number;
            total: number;
        };
        dependencies: {
            prod: number;
            dev: number;
            optional: number;
            total: number;
        };
    };
}

export interface SecurityHeaders {
    'X-Content-Type-Options': string;
    'X-Frame-Options': string;
    'X-XSS-Protection': string;
    'Content-Security-Policy': string;
    [key: string]: string;
}

export interface NodeSecurityConfig {
    version: string;
    security: {
        strictSSL: boolean;
        [key: string]: any;
    };
    audit: boolean;
}

export interface ElectronSecurityConfig {
    contextIsolation: boolean;
    nodeIntegration: boolean;
    sandbox: boolean;
    webSecurity: boolean;
    allowRunningInsecureContent: boolean;
    webviewTag: boolean;
    protocolHandlers: string[];
    ipcMain: {
        allow: string[];
        block: string[];
    };
    fileSystemAccess: {
        allow: string[];
        block: string[];
        pathTraversalProtection: boolean;
        sanitizePaths: boolean;
        requirePermissions: boolean;
        permissionCheckInterval: number;
        restrictedDirs: string[];
        allowUserDirs: boolean;
        allowedFileTypes: string[];
        blockedFileTypes: string[];
        watchdogEnabled: boolean;
        watchdogInterval: number;
        watchdogLogPath: string;
        audit: {
            enabled: boolean;
            logPath: string;
            retentionDays: number;
        };
        requireEncryption: boolean;
        encryptionAlgorithm: string;
        keyRotationInterval: number;
        backup: {
            enabled: boolean;
            interval: number;
            retentionDays: number;
        };
        recovery: {
            enabled: boolean;
            maxAttempts: number;
            retryDelay: number;
        };
    };
}

export interface ConfigFile {
    path: string;
    valid: boolean;
    errors?: string[];
}
