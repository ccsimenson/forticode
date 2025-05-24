import { SecurityScanResult } from './types';
declare class SecurityScanner {
    private static instance;
    private checks;
    private createErrorResult;
    private createSuccessResult;
    private createFailureResult;
    private constructor();
    static getInstance(): SecurityScanner;
    runFullScan(): Promise<SecurityScanResult>;
    private createSecurityHeadersCheck;
    private createDependencyCheck;
    private createNodeSecurityCheck;
    private createElectronSecurityCheck;
    private createConfigValidationCheck;
    private validateNodeSecurity;
    private validateElectronSecurity;
}
export default SecurityScanner;
//# sourceMappingURL=security-scanner.d.ts.map