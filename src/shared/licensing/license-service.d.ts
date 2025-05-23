import { LicenseKeyPayload, LicenseValidationResult, Feature } from './types';
export declare class LicenseService {
    private static instance;
    private licenseData;
    private validationCache;
    private readonly machineId;
    private readonly licensePath;
    private constructor();
    static getInstance(): LicenseService;
    private getMachineId;
    private loadLicense;
    private saveLicense;
    activateLicense(licenseKey: string): Promise<LicenseValidationResult>;
    deactivateLicense(): Promise<void>;
    validateLicense(): Promise<LicenseValidationResult>;
    private validateWithServer;
    private signPayload;
    private verifySignature;
    private validateLicenseSync;
    isFeatureEnabled(feature: Feature): boolean;
    getLicenseInfo(): Promise<{
        licenseKey: string;
        customerId: string;
        features: string[];
        expiryDate: string | undefined;
        issuedAt: string;
        lastValidated: string;
    } | null>;
    generateLicense(payload: Omit<LicenseKeyPayload, 'issuedAt'>): Promise<{
        licenseKey: string;
        signature: string;
    }>;
    generateTrialLicense(tier?: 'pro' | 'enterprise'): Promise<{
        licenseKey: string;
        signature: string;
    }>;
    private signData;
}
export declare const licenseService: LicenseService;
//# sourceMappingURL=license-service.d.ts.map