export interface LicenseKeyPayload {
  features: string[];
  expiryDate?: string; // ISO date string
  customerId: string;
  version: string;
  issuedAt: string; // ISO date string
  tier: 'free' | 'pro' | 'enterprise';
}

export interface LicenseValidationResult {
  isValid: boolean;
  error?: string;
  payload?: LicenseKeyPayload;
}

export enum Feature {
  // Free tier features (always available)
  BASIC_CSP_VALIDATION = 'basic_csp_validation',
  INLINE_SCRIPT_DETECTION = 'inline_script_detection',
  BASIC_GITHUB_INTEGRATION = 'basic_github_integration',
  BASIC_SECURITY_REPORTS = 'basic_security_reports',
  TRY_ME_OUT_WIDGET = 'try_me_out_widget',
  BASIC_PERFORMANCE_METRICS = 'basic_performance_metrics',
  
  // Pro tier features
  ADVANCED_CSP_ANALYSIS = 'advanced_csp_analysis',
  AUTOMATED_FIX_SUGGESTIONS = 'automated_fix_suggestions',
  FULL_GITHUB_INTEGRATION = 'full_github_integration',
  COMPLIANCE_REPORTING = 'compliance_reporting',
  
  // Enterprise tier features
  ROLE_BASED_ACCESS_CONTROL = 'role_based_access_control',
  SELF_HOSTED_DEPLOYMENT = 'self_hosted_deployment',
  PRIORITY_SUPPORT = 'priority_support',
  CONSULTING_SERVICES = 'consulting_services',
  
  // Legacy features (kept for backward compatibility)
  BASIC_SCANNING = 'basic_scanning',
  ADVANCED_VULNERABILITY_SCANNING = 'advanced_vulnerability_scanning',
  AUTOMATED_REPORTING = 'automated_reporting',
  TEAM_COLLABORATION = 'team_collaboration',
  CUSTOM_POLICIES = 'custom_policies',
  SCHEDULED_SCANS = 'scheduled_scans',
  API_ACCESS = 'api_access'
}

export const FEATURES = {
  // Free tier features
  [Feature.BASIC_CSP_VALIDATION]: {
    name: 'Basic CSP Validation',
    description: 'Checks for common policy violations',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.INLINE_SCRIPT_DETECTION]: {
    name: 'Inline Script Detection',
    description: 'Flags unsafe-inline issues',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.BASIC_GITHUB_INTEGRATION]: {
    name: 'Basic GitHub Integration',
    description: 'Runs CSP scans on PRs',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.BASIC_SECURITY_REPORTS]: {
    name: 'Basic Security Reports',
    description: 'Generates simple violation summaries',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.TRY_ME_OUT_WIDGET]: {
    name: 'Try Me Out Widget',
    description: 'Interactive CSP tester',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.BASIC_PERFORMANCE_METRICS]: {
    name: 'Basic Performance Metrics',
    description: 'Basic validation speed/memory usage tracking',
    requiresLicense: false,
    tier: 'free' as const
  },

  // Pro tier features
  [Feature.ADVANCED_CSP_ANALYSIS]: {
    name: 'Advanced CSP Analysis',
    description: 'Detects complex CSP weaknesses',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.AUTOMATED_FIX_SUGGESTIONS]: {
    name: 'Automated Fix Suggestions',
    description: 'AI-driven CSP improvements',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.FULL_GITHUB_INTEGRATION]: {
    name: 'Full GitHub Integration',
    description: 'Custom security workflows + pull request enforcement',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.COMPLIANCE_REPORTING]: {
    name: 'Compliance Reporting',
    description: 'Generates audit-ready security compliance reports',
    requiresLicense: true,
    tier: 'pro' as const
  },

  // Enterprise tier features
  [Feature.ROLE_BASED_ACCESS_CONTROL]: {
    name: 'Role-Based Access Control',
    description: 'Enterprise-level permissions for security teams',
    requiresLicense: true,
    tier: 'enterprise' as const
  },
  [Feature.SELF_HOSTED_DEPLOYMENT]: {
    name: 'Self-Hosted Deployment',
    description: 'Allows companies to run FortiCode internally',
    requiresLicense: true,
    tier: 'enterprise' as const
  },
  [Feature.PRIORITY_SUPPORT]: {
    name: 'Priority Support',
    description: 'Direct access for enterprise security professionals',
    requiresLicense: true,
    tier: 'enterprise' as const
  },
  [Feature.CONSULTING_SERVICES]: {
    name: 'Consulting Services',
    description: 'Custom security consulting and implementation',
    requiresLicense: true,
    tier: 'enterprise' as const
  },

  // Legacy features (kept for backward compatibility)
  [Feature.BASIC_SCANNING]: {
    name: 'Basic Security Scanning',
    description: 'Perform basic security scans for common vulnerabilities',
    requiresLicense: false,
    tier: 'free' as const
  },
  [Feature.ADVANCED_VULNERABILITY_SCANNING]: {
    name: 'Advanced Vulnerability Scanning',
    description: 'Advanced vulnerability detection with deeper analysis',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.AUTOMATED_REPORTING]: {
    name: 'Automated Reporting',
    description: 'Generate and schedule automated security reports',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.TEAM_COLLABORATION]: {
    name: 'Team Collaboration',
    description: 'Share scan results and collaborate with team members',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.CUSTOM_POLICIES]: {
    name: 'Custom Security Policies',
    description: 'Define and enforce custom security policies',
    requiresLicense: true,
    tier: 'enterprise' as const
  },
  [Feature.SCHEDULED_SCANS]: {
    name: 'Scheduled Scans',
    description: 'Schedule automated security scans',
    requiresLicense: true,
    tier: 'pro' as const
  },
  [Feature.API_ACCESS]: {
    name: 'API Access',
    description: 'Access security scan results via API',
    requiresLicense: true,
    tier: 'enterprise' as const
  }
} as const;
