import { Feature } from './types';
/**
 * Check if a specific feature is enabled for the current license
 */
export declare function isFeatureEnabled(feature: Feature): boolean;
/**
 * Get information about all available features and their activation status
 */
export declare function getAllFeaturesStatus(): ({
    isEnabled: boolean;
    name: "Basic CSP Validation";
    description: "Checks for common policy violations";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Inline Script Detection";
    description: "Flags unsafe-inline issues";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Basic GitHub Integration";
    description: "Runs CSP scans on PRs";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Basic Security Reports";
    description: "Generates simple violation summaries";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Try Me Out Widget";
    description: "Interactive CSP tester";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Basic Performance Metrics";
    description: "Basic validation speed/memory usage tracking";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Advanced CSP Analysis";
    description: "Detects complex CSP weaknesses";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Automated Fix Suggestions";
    description: "AI-driven CSP improvements";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Full GitHub Integration";
    description: "Custom security workflows + pull request enforcement";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Compliance Reporting";
    description: "Generates audit-ready security compliance reports";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Role-Based Access Control";
    description: "Enterprise-level permissions for security teams";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
} | {
    isEnabled: boolean;
    name: "Self-Hosted Deployment";
    description: "Allows companies to run FortiCode internally";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
} | {
    isEnabled: boolean;
    name: "Priority Support";
    description: "Direct access for enterprise security professionals";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
} | {
    isEnabled: boolean;
    name: "Consulting Services";
    description: "Custom security consulting and implementation";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
} | {
    isEnabled: boolean;
    name: "Basic Security Scanning";
    description: "Perform basic security scans for common vulnerabilities";
    requiresLicense: false;
    tier: "free";
    id: string;
} | {
    isEnabled: boolean;
    name: "Advanced Vulnerability Scanning";
    description: "Advanced vulnerability detection with deeper analysis";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Automated Reporting";
    description: "Generate and schedule automated security reports";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Team Collaboration";
    description: "Share scan results and collaborate with team members";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "Custom Security Policies";
    description: "Define and enforce custom security policies";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
} | {
    isEnabled: boolean;
    name: "Scheduled Scans";
    description: "Schedule automated security scans";
    requiresLicense: true;
    tier: "pro";
    id: string;
} | {
    isEnabled: boolean;
    name: "API Access";
    description: "Access security scan results via API";
    requiresLicense: true;
    tier: "enterprise";
    id: string;
})[];
/**
 * Require a specific feature to be enabled
 * @throws {Error} If the feature is not enabled
 */
export declare function requireFeature(feature: Feature): void;
/**
 * A higher-order function that only allows the wrapped function to be called
 * if the specified feature is enabled
 */
export declare function withFeature<T extends (...args: any[]) => any>(feature: Feature, fn: T): T;
/**
 * A decorator that can be used to protect class methods with a feature flag
 */
export declare function requiresFeature(feature: Feature): (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=feature-flags.d.ts.map