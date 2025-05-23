export interface LicenseKeyPayload {
    features: string[];
    expiryDate?: string;
    customerId: string;
    version: string;
    issuedAt: string;
    tier: 'free' | 'pro' | 'enterprise';
}
export interface LicenseValidationResult {
    isValid: boolean;
    error?: string;
    payload?: LicenseKeyPayload;
}
export declare enum Feature {
    BASIC_CSP_VALIDATION = "basic_csp_validation",
    INLINE_SCRIPT_DETECTION = "inline_script_detection",
    BASIC_GITHUB_INTEGRATION = "basic_github_integration",
    BASIC_SECURITY_REPORTS = "basic_security_reports",
    TRY_ME_OUT_WIDGET = "try_me_out_widget",
    BASIC_PERFORMANCE_METRICS = "basic_performance_metrics",
    ADVANCED_CSP_ANALYSIS = "advanced_csp_analysis",
    AUTOMATED_FIX_SUGGESTIONS = "automated_fix_suggestions",
    FULL_GITHUB_INTEGRATION = "full_github_integration",
    COMPLIANCE_REPORTING = "compliance_reporting",
    ROLE_BASED_ACCESS_CONTROL = "role_based_access_control",
    SELF_HOSTED_DEPLOYMENT = "self_hosted_deployment",
    PRIORITY_SUPPORT = "priority_support",
    CONSULTING_SERVICES = "consulting_services",
    BASIC_SCANNING = "basic_scanning",
    ADVANCED_VULNERABILITY_SCANNING = "advanced_vulnerability_scanning",
    AUTOMATED_REPORTING = "automated_reporting",
    TEAM_COLLABORATION = "team_collaboration",
    CUSTOM_POLICIES = "custom_policies",
    SCHEDULED_SCANS = "scheduled_scans",
    API_ACCESS = "api_access"
}
export declare const FEATURES: {
    readonly basic_csp_validation: {
        readonly name: "Basic CSP Validation";
        readonly description: "Checks for common policy violations";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly inline_script_detection: {
        readonly name: "Inline Script Detection";
        readonly description: "Flags unsafe-inline issues";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly basic_github_integration: {
        readonly name: "Basic GitHub Integration";
        readonly description: "Runs CSP scans on PRs";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly basic_security_reports: {
        readonly name: "Basic Security Reports";
        readonly description: "Generates simple violation summaries";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly try_me_out_widget: {
        readonly name: "Try Me Out Widget";
        readonly description: "Interactive CSP tester";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly basic_performance_metrics: {
        readonly name: "Basic Performance Metrics";
        readonly description: "Basic validation speed/memory usage tracking";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly advanced_csp_analysis: {
        readonly name: "Advanced CSP Analysis";
        readonly description: "Detects complex CSP weaknesses";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly automated_fix_suggestions: {
        readonly name: "Automated Fix Suggestions";
        readonly description: "AI-driven CSP improvements";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly full_github_integration: {
        readonly name: "Full GitHub Integration";
        readonly description: "Custom security workflows + pull request enforcement";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly compliance_reporting: {
        readonly name: "Compliance Reporting";
        readonly description: "Generates audit-ready security compliance reports";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly role_based_access_control: {
        readonly name: "Role-Based Access Control";
        readonly description: "Enterprise-level permissions for security teams";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
    readonly self_hosted_deployment: {
        readonly name: "Self-Hosted Deployment";
        readonly description: "Allows companies to run FortiCode internally";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
    readonly priority_support: {
        readonly name: "Priority Support";
        readonly description: "Direct access for enterprise security professionals";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
    readonly consulting_services: {
        readonly name: "Consulting Services";
        readonly description: "Custom security consulting and implementation";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
    readonly basic_scanning: {
        readonly name: "Basic Security Scanning";
        readonly description: "Perform basic security scans for common vulnerabilities";
        readonly requiresLicense: false;
        readonly tier: "free";
    };
    readonly advanced_vulnerability_scanning: {
        readonly name: "Advanced Vulnerability Scanning";
        readonly description: "Advanced vulnerability detection with deeper analysis";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly automated_reporting: {
        readonly name: "Automated Reporting";
        readonly description: "Generate and schedule automated security reports";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly team_collaboration: {
        readonly name: "Team Collaboration";
        readonly description: "Share scan results and collaborate with team members";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly custom_policies: {
        readonly name: "Custom Security Policies";
        readonly description: "Define and enforce custom security policies";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
    readonly scheduled_scans: {
        readonly name: "Scheduled Scans";
        readonly description: "Schedule automated security scans";
        readonly requiresLicense: true;
        readonly tier: "pro";
    };
    readonly api_access: {
        readonly name: "API Access";
        readonly description: "Access security scan results via API";
        readonly requiresLicense: true;
        readonly tier: "enterprise";
    };
};
//# sourceMappingURL=types.d.ts.map