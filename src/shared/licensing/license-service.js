"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseService = exports.LicenseService = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("./types");
const LICENSE_FILE_NAME = 'license.json';
class LicenseService {
    constructor() {
        this.licenseData = null;
        this.validationCache = new Map();
        this.machineId = this.getMachineId();
        this.licensePath = path_1.default.join(electron_1.app.getPath('userData'), LICENSE_FILE_NAME);
        this.loadLicense();
    }
    static getInstance() {
        if (!LicenseService.instance) {
            LicenseService.instance = new LicenseService();
        }
        return LicenseService.instance;
    }
    getMachineId() {
        // Generate a machine-specific ID
        const networkInterfaces = require('os').networkInterfaces();
        let macAddress = '';
        // Get the first non-internal MAC address
        for (const name of Object.keys(networkInterfaces)) {
            for (const net of networkInterfaces[name]) {
                if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
                    macAddress = net.mac;
                    break;
                }
            }
            if (macAddress)
                break;
        }
        return crypto_1.default.createHash('sha256')
            .update(macAddress + electron_1.app.getPath('userData'), 'utf8')
            .digest('hex');
    }
    async loadLicense() {
        try {
            if (await fs_extra_1.default.pathExists(this.licensePath)) {
                this.licenseData = await fs_extra_1.default.readJson(this.licensePath);
                // Validate the loaded license
                await this.validateLicense();
            }
        }
        catch (error) {
            console.error('Failed to load license:', error);
            this.licenseData = null;
        }
    }
    async saveLicense(licenseKey, signature) {
        this.licenseData = {
            licenseKey,
            signature,
            machineId: this.machineId,
            lastValidated: new Date().toISOString()
        };
        await fs_extra_1.default.ensureDir(path_1.default.dirname(this.licensePath));
        await fs_extra_1.default.writeJson(this.licensePath, this.licenseData, { spaces: 2 });
    }
    async activateLicense(licenseKey) {
        try {
            // Remove any whitespace and normalize the key
            licenseKey = licenseKey.trim().replace(/\s+/g, '');
            // Basic format validation
            if (!/^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/i.test(licenseKey)) {
                return {
                    isValid: false,
                    error: 'Invalid license key format. Expected format: XXXX-XXXX-XXXX-XXXX'
                };
            }
            // In a real implementation, you would validate the license with your license server
            // For this example, we'll simulate a successful validation
            const validationResult = await this.validateWithServer(licenseKey);
            if (validationResult.isValid && validationResult.payload) {
                // Sign the license payload with your private key (in a real app, this would be done on the server)
                const signature = this.signPayload(validationResult.payload);
                await this.saveLicense(licenseKey, signature);
            }
            return validationResult;
        }
        catch (error) {
            console.error('License activation failed:', error);
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown error during license activation'
            };
        }
    }
    async deactivateLicense() {
        try {
            if (await fs_extra_1.default.pathExists(this.licensePath)) {
                await fs_extra_1.default.remove(this.licensePath);
            }
            this.licenseData = null;
            this.validationCache.clear();
        }
        catch (error) {
            console.error('Failed to deactivate license:', error);
            throw error;
        }
    }
    async validateLicense() {
        if (!this.licenseData) {
            return { isValid: false, error: 'No license found' };
        }
        const cacheKey = `${this.licenseData.licenseKey}:${this.machineId}`;
        // Return cached validation if available and not expired (cache for 1 hour)
        const cached = this.validationCache.get(cacheKey);
        if (cached &&
            Date.now() - new Date(cached.payload?.issuedAt || 0).getTime() < 3600000) {
            return cached;
        }
        try {
            // Verify the signature
            const isValidSignature = this.verifySignature(this.licenseData.licenseKey, this.licenseData.signature);
            if (!isValidSignature) {
                return { isValid: false, error: 'Invalid license signature' };
            }
            // In a real app, you would validate with your license server here
            const validationResult = await this.validateWithServer(this.licenseData.licenseKey);
            // Cache the validation result
            if (validationResult.isValid) {
                this.validationCache.set(cacheKey, validationResult);
            }
            return validationResult;
        }
        catch (error) {
            console.error('License validation failed:', error);
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown validation error'
            };
        }
    }
    async validateWithServer(_licenseKey) {
        // In a real implementation, this would make an API call to your license server
        // For demonstration, we'll simulate a successful validation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    isValid: true,
                    payload: {
                        features: [
                            types_1.Feature.ADVANCED_VULNERABILITY_SCANNING,
                            types_1.Feature.AUTOMATED_REPORTING
                        ],
                        customerId: 'demo-customer',
                        version: '1.0.0',
                        issuedAt: new Date().toISOString(),
                        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        tier: 'pro'
                    }
                });
            }, 500);
        });
    }
    signPayload(payload) {
        const sign = crypto_1.default.createSign('RSA-SHA256');
        sign.update(JSON.stringify(payload));
        // In a real implementation, use a proper private key
        return sign.sign("your_private_key_here", 'base64');
    }
    verifySignature(_licenseKey, _signature) {
        try {
            // In a real implementation, you would verify the signature with your public key
            // This is a simplified version that always returns true for demonstration
            return true;
        }
        catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }
    validateLicenseSync() {
        if (!this.licenseData) {
            return { isValid: false, error: 'No license found' };
        }
        // Return a default valid result for demonstration
        return {
            isValid: true,
            payload: {
                features: [types_1.Feature.BASIC_CSP_VALIDATION],
                customerId: 'demo-customer',
                version: '1.0.0',
                issuedAt: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                tier: 'pro'
            }
        };
    }
    isFeatureEnabled(feature) {
        // Check if feature exists
        const featureInfo = types_1.FEATURES[feature];
        if (!featureInfo) {
            console.warn(`Unknown feature: ${feature}`);
            return false;
        }
        // Free features are always enabled
        if (featureInfo.tier === 'free') {
            return true;
        }
        // Check if we have a valid license
        const validation = this.validateLicenseSync();
        if (!validation.isValid || !validation.payload) {
            return false;
        }
        const licenseTier = validation.payload.tier;
        // Check if the license tier is sufficient for this feature
        if (licenseTier === 'enterprise') {
            // Enterprise tier has access to all features
            return true;
        }
        else if (licenseTier === 'pro' && featureInfo.tier === 'pro') {
            // Pro tier has access to pro and free features
            return true;
        }
        // Free tier only has access to free features (already handled above)
        return false;
    }
    async getLicenseInfo() {
        if (!this.licenseData) {
            return null;
        }
        const validation = await this.validateLicense();
        if (!validation.isValid || !validation.payload) {
            return null;
        }
        return {
            licenseKey: this.licenseData.licenseKey,
            customerId: validation.payload.customerId,
            features: validation.payload.features,
            expiryDate: validation.payload.expiryDate,
            issuedAt: validation.payload.issuedAt,
            lastValidated: this.licenseData.lastValidated
        };
    }
    async generateLicense(payload) {
        // Ensure tier is set
        if (!payload.tier) {
            // Default to free tier if not specified
            payload.tier = 'free';
        }
        const completePayload = {
            ...payload,
            issuedAt: new Date().toISOString(),
            tier: payload.tier || 'free' // Ensure tier is always set
        };
        const licenseKey = Buffer.from(JSON.stringify(completePayload)).toString('base64');
        const signature = this.signData(licenseKey);
        return { licenseKey, signature };
    }
    async generateTrialLicense(tier = 'pro') {
        // Define features based on tier
        let trialFeatures = [];
        if (tier === 'pro') {
            trialFeatures = [
                // Pro tier features
                types_1.Feature.ADVANCED_CSP_ANALYSIS,
                types_1.Feature.AUTOMATED_FIX_SUGGESTIONS,
                types_1.Feature.FULL_GITHUB_INTEGRATION,
                types_1.Feature.COMPLIANCE_REPORTING,
                // Include legacy features for backward compatibility
                types_1.Feature.ADVANCED_VULNERABILITY_SCANNING,
                types_1.Feature.AUTOMATED_REPORTING,
                types_1.Feature.TEAM_COLLABORATION,
                types_1.Feature.SCHEDULED_SCANS
            ];
        }
        else if (tier === 'enterprise') {
            trialFeatures = [
                // All features
                ...Object.values(types_1.Feature).filter(f => typeof f === 'string' &&
                    f !== types_1.Feature.BASIC_SCANNING // Skip the legacy basic scanning feature
                )
            ];
        }
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30-day trial
        const payload = {
            features: trialFeatures,
            customerId: `trial-${tier}-${Date.now()}`,
            version: electron_1.app.getVersion(),
            expiryDate: expiryDate.toISOString(),
            tier
        };
        return this.generateLicense(payload);
    }
    signData(_data) {
        // In a real implementation, you would sign the data with a private key
        // For demonstration purposes, we're just returning a hash
        return crypto_1.default.createHash('sha256').update('demo').digest('hex');
    }
}
exports.LicenseService = LicenseService;
// Export a singleton instance
exports.licenseService = LicenseService.getInstance();
//# sourceMappingURL=license-service.js.map