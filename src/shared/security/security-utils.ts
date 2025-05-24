import { SecurityScanResult } from './types';

/**
 * Utility class for security-related functions
 */
class SecurityUtils {
    /**
     * Generate a human-readable report from scan results
     */
    static generateReport(results: SecurityScanResult): string {
        let report = `# Security Scan Report - ${results.timestamp.toLocaleString()}

## Summary
- Total Checks: ${results.checks.length}
- Passed: ${results.checks.filter(c => c.status === 'PASS').length}
- Failed: ${results.checks.filter(c => c.status === 'FAIL').length}
- Errors: ${results.checks.filter(c => c.status === 'ERROR').length}

## Detailed Results

`;

        for (const check of results.checks) {
            report += `### ${check.name} - ${check.status}\n`;
                
            if (check.status === 'ERROR') {
                report += `Error: ${check.result.details['error']}\n\n`;
                continue;
            }

            for (const [key, value] of Object.entries(check.result.details)) {
                if (key === 'error') continue;
                const formattedValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
                report += `- **${key}**: ${formattedValue}\n`;
            }
            report += '\n';
        }

        return report;
    }

    /**
     * Get overall security score (0-100)
     */
    static getSecurityScore(results: SecurityScanResult): number {
        const totalChecks = results.checks.length;
        const passedChecks = results.checks.filter(c => c.status === 'PASS').length;
        const errorChecks = results.checks.filter(c => c.status === 'ERROR').length;

        // Calculate base score (0-100)
        let score = (passedChecks / totalChecks) * 100;

        // Penalize for errors
        if (errorChecks > 0) {
            score -= (errorChecks / totalChecks) * 50; // Each error reduces score by 50%
        }
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get critical vulnerabilities from scan results
     */
    static getCriticalVulnerabilities(results: SecurityScanResult): Array<any> {
        const vulnerabilities: any[] = [];
        
        for (const check of results.checks) {
            if (check.name === 'Dependency Vulnerability Scan' && check.status === 'FAIL') {
                const details = check.result.details;
                if (details && details['vulnerabilities'] && Array.isArray(details['vulnerabilities'])) {
                    vulnerabilities.push(...details['vulnerabilities'].filter((v: any) => v.severity === 'critical'));
                }
            }
        }
        
        return vulnerabilities;
    }
}

export default SecurityUtils;
