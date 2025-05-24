import { SecurityCheck, SecurityCheckResult } from './types';
import { VulnerabilityService } from './vulnerability-service';
export declare class SecurityHeadersCheck implements SecurityCheck {
    name: string;
    run(): Promise<SecurityCheckResult>;
}
export declare class DependencyCheck implements SecurityCheck {
    name: string;
    private vulnerabilityService;
    run(): Promise<SecurityCheckResult>;
}
export declare class NodeSecurityCheck implements SecurityCheck {
    name: string;
    run(): Promise<SecurityCheckResult>;
}
export declare class ElectronSecurityCheck implements SecurityCheck {
    name: string;
    private vulnerabilityService;
    run(): Promise<SecurityCheckResult>;
    private checkNodeVersion;
    private checkElectronVersion;
    private checkPackageDependencies;
}
export declare class ConfigFileValidationCheck implements SecurityCheck {
    name: string;
    private vulnerabilityService;
    constructor(vulnerabilityService: VulnerabilityService);
    run(): Promise<SecurityCheckResult>;
    private checkPackageDependencies;
}
//# sourceMappingURL=security-checks.d.ts.map