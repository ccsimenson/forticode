"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURES = exports.Feature = void 0;
var Feature;
(function (Feature) {
    // Free tier features (always available)
    Feature["BASIC_CSP_VALIDATION"] = "basic_csp_validation";
    Feature["INLINE_SCRIPT_DETECTION"] = "inline_script_detection";
    Feature["BASIC_GITHUB_INTEGRATION"] = "basic_github_integration";
    Feature["BASIC_SECURITY_REPORTS"] = "basic_security_reports";
    Feature["TRY_ME_OUT_WIDGET"] = "try_me_out_widget";
    Feature["BASIC_PERFORMANCE_METRICS"] = "basic_performance_metrics";
    // Pro tier features
    Feature["ADVANCED_CSP_ANALYSIS"] = "advanced_csp_analysis";
    Feature["AUTOMATED_FIX_SUGGESTIONS"] = "automated_fix_suggestions";
    Feature["FULL_GITHUB_INTEGRATION"] = "full_github_integration";
    Feature["COMPLIANCE_REPORTING"] = "compliance_reporting";
    // Enterprise tier features
    Feature["ROLE_BASED_ACCESS_CONTROL"] = "role_based_access_control";
    Feature["SELF_HOSTED_DEPLOYMENT"] = "self_hosted_deployment";
    Feature["PRIORITY_SUPPORT"] = "priority_support";
    Feature["CONSULTING_SERVICES"] = "consulting_services";
    // Legacy features (kept for backward compatibility)
    Feature["BASIC_SCANNING"] = "basic_scanning";
    Feature["ADVANCED_VULNERABILITY_SCANNING"] = "advanced_vulnerability_scanning";
    Feature["AUTOMATED_REPORTING"] = "automated_reporting";
    Feature["TEAM_COLLABORATION"] = "team_collaboration";
    Feature["CUSTOM_POLICIES"] = "custom_policies";
    Feature["SCHEDULED_SCANS"] = "scheduled_scans";
    Feature["API_ACCESS"] = "api_access";
})(Feature || (exports.Feature = Feature = {}));
exports.FEATURES = {
    // Free tier features
    [Feature.BASIC_CSP_VALIDATION]: {
        name: 'Basic CSP Validation',
        description: 'Checks for common policy violations',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.INLINE_SCRIPT_DETECTION]: {
        name: 'Inline Script Detection',
        description: 'Flags unsafe-inline issues',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.BASIC_GITHUB_INTEGRATION]: {
        name: 'Basic GitHub Integration',
        description: 'Runs CSP scans on PRs',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.BASIC_SECURITY_REPORTS]: {
        name: 'Basic Security Reports',
        description: 'Generates simple violation summaries',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.TRY_ME_OUT_WIDGET]: {
        name: 'Try Me Out Widget',
        description: 'Interactive CSP tester',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.BASIC_PERFORMANCE_METRICS]: {
        name: 'Basic Performance Metrics',
        description: 'Basic validation speed/memory usage tracking',
        requiresLicense: false,
        tier: 'free'
    },
    // Pro tier features
    [Feature.ADVANCED_CSP_ANALYSIS]: {
        name: 'Advanced CSP Analysis',
        description: 'Detects complex CSP weaknesses',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.AUTOMATED_FIX_SUGGESTIONS]: {
        name: 'Automated Fix Suggestions',
        description: 'AI-driven CSP improvements',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.FULL_GITHUB_INTEGRATION]: {
        name: 'Full GitHub Integration',
        description: 'Custom security workflows + pull request enforcement',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.COMPLIANCE_REPORTING]: {
        name: 'Compliance Reporting',
        description: 'Generates audit-ready security compliance reports',
        requiresLicense: true,
        tier: 'pro'
    },
    // Enterprise tier features
    [Feature.ROLE_BASED_ACCESS_CONTROL]: {
        name: 'Role-Based Access Control',
        description: 'Enterprise-level permissions for security teams',
        requiresLicense: true,
        tier: 'enterprise'
    },
    [Feature.SELF_HOSTED_DEPLOYMENT]: {
        name: 'Self-Hosted Deployment',
        description: 'Allows companies to run FortiCode internally',
        requiresLicense: true,
        tier: 'enterprise'
    },
    [Feature.PRIORITY_SUPPORT]: {
        name: 'Priority Support',
        description: 'Direct access for enterprise security professionals',
        requiresLicense: true,
        tier: 'enterprise'
    },
    [Feature.CONSULTING_SERVICES]: {
        name: 'Consulting Services',
        description: 'Custom security consulting and implementation',
        requiresLicense: true,
        tier: 'enterprise'
    },
    // Legacy features (kept for backward compatibility)
    [Feature.BASIC_SCANNING]: {
        name: 'Basic Security Scanning',
        description: 'Perform basic security scans for common vulnerabilities',
        requiresLicense: false,
        tier: 'free'
    },
    [Feature.ADVANCED_VULNERABILITY_SCANNING]: {
        name: 'Advanced Vulnerability Scanning',
        description: 'Advanced vulnerability detection with deeper analysis',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.AUTOMATED_REPORTING]: {
        name: 'Automated Reporting',
        description: 'Generate and schedule automated security reports',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.TEAM_COLLABORATION]: {
        name: 'Team Collaboration',
        description: 'Share scan results and collaborate with team members',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.CUSTOM_POLICIES]: {
        name: 'Custom Security Policies',
        description: 'Define and enforce custom security policies',
        requiresLicense: true,
        tier: 'enterprise'
    },
    [Feature.SCHEDULED_SCANS]: {
        name: 'Scheduled Scans',
        description: 'Schedule automated security scans',
        requiresLicense: true,
        tier: 'pro'
    },
    [Feature.API_ACCESS]: {
        name: 'API Access',
        description: 'Access security scan results via API',
        requiresLicense: true,
        tier: 'enterprise'
    }
};
//# sourceMappingURL=types.js.map