export interface SecurityCheck {
    name: string;
    run(): Promise<SecurityCheckResult>;
}

export interface SecurityCheckResult {
    passed: boolean;
    details: Record<string, any>;
}

export interface SecurityScanResult {
    timestamp: Date;
    checks: Array<{
        name: string;
        result: SecurityCheckResult;
        status: 'PASS' | 'FAIL' | 'ERROR';
    }>;
}

export interface Vulnerability {
    name: string;
    version: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    references: string[];
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
    [key: string]: any;
}

export interface ConfigFile {
    path: string;
    valid: boolean;
    errors?: string[];
}
