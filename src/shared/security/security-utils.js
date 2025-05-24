"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SecurityUtils {
    /**
     * Generate a human-readable report from scan results
     */
    static generateReport(results) {
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
            }
            else {
                const details = check.result.details;
                if (details) {
                    for (const [key, value] of Object.entries(details)) {
                        if (typeof value === 'object') {
                            report += `#### ${key}\n`;
                            if (value) {
                                for (const [subKey, subValue] of Object.entries(value)) {
                                    report += `- ${subKey}: ${subValue}\n`;
                                }
                                report += '\n';
                            }
                        }
                        else {
                            report += `- ${key}: ${value}\n`;
                        }
                    }
                }
            }
            report += '\n';
        }
        return report;
    }
    /**
     * Get overall security score (0-100)
     */
    static getSecurityScore(results) {
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
    static getCriticalVulnerabilities(results) {
        const vulnerabilities = [];
        for (const check of results.checks) {
            if (check.name === 'Dependency Vulnerability Scan' && check.status === 'FAIL') {
                const details = check.result.details;
                if (details && details['vulnerabilities'] && Array.isArray(details['vulnerabilities'])) {
                    vulnerabilities.push(...details['vulnerabilities'].filter((v) => v.severity === 'critical'));
                }
            }
        }
        return vulnerabilities;
    }
}
exports.default = SecurityUtils;
//# sourceMappingURL=security-utils.js.map