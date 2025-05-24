import { SecurityScanResult } from './types';
declare class SecurityUtils {
    /**
     * Generate a human-readable report from scan results
     */
    static generateReport(results: SecurityScanResult): string;
    /**
     * Get overall security score (0-100)
     */
    static getSecurityScore(results: SecurityScanResult): number;
    /**
     * Get critical vulnerabilities from scan results
     */
    static getCriticalVulnerabilities(results: SecurityScanResult): any[];
}
export default SecurityUtils;
//# sourceMappingURL=security-utils.d.ts.map