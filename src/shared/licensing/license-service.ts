import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import { 
  LicenseKeyPayload, 
  LicenseValidationResult, 
  Feature,
  FEATURES 
} from './types';

const LICENSE_FILE_NAME = 'license.json';
// Public key would be defined here in production
// const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----...`;

interface StoredLicense {
  licenseKey: string;
  signature: string;
  machineId: string;
  lastValidated: string;
}

export class LicenseService {
  private static instance: LicenseService;
  private licenseData: StoredLicense | null = null;
  private validationCache: Map<string, LicenseValidationResult> = new Map();
  private readonly machineId: string;
  private readonly licensePath: string;

  private constructor() {
    this.machineId = this.getMachineId();
    this.licensePath = path.join(app.getPath('userData'), LICENSE_FILE_NAME);
    this.loadLicense();
  }

  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  private getMachineId(): string {
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
      if (macAddress) break;
    }
    
    return crypto.createHash('sha256')
      .update(macAddress + app.getPath('userData'), 'utf8')
      .digest('hex');
  }

  private async loadLicense(): Promise<void> {
    try {
      if (await fs.pathExists(this.licensePath)) {
        this.licenseData = await fs.readJson(this.licensePath);
        // Validate the loaded license
        await this.validateLicense();
      }
    } catch (error) {
      console.error('Failed to load license:', error);
      this.licenseData = null;
    }
  }

  private async saveLicense(licenseKey: string, signature: string): Promise<void> {
    this.licenseData = {
      licenseKey,
      signature,
      machineId: this.machineId,
      lastValidated: new Date().toISOString()
    };
    
    await fs.ensureDir(path.dirname(this.licensePath));
    await fs.writeJson(this.licensePath, this.licenseData, { spaces: 2 });
  }

  public async activateLicense(licenseKey: string): Promise<LicenseValidationResult> {
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
    } catch (error) {
      console.error('License activation failed:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error during license activation' 
      };
    }
  }

  public async deactivateLicense(): Promise<void> {
    try {
      if (await fs.pathExists(this.licensePath)) {
        await fs.remove(this.licensePath);
      }
      this.licenseData = null;
      this.validationCache.clear();
    } catch (error) {
      console.error('Failed to deactivate license:', error);
      throw error;
    }
  }

  public async validateLicense(): Promise<LicenseValidationResult> {
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
      const isValidSignature = this.verifySignature(
        this.licenseData.licenseKey,
        this.licenseData.signature
      );

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
    } catch (error) {
      console.error('License validation failed:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  private async validateWithServer(_licenseKey: string): Promise<LicenseValidationResult> {
    // In a real implementation, this would make an API call to your license server
    // For demonstration, we'll simulate a successful validation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isValid: true,
          payload: {
            features: [
              Feature.ADVANCED_VULNERABILITY_SCANNING,
              Feature.AUTOMATED_REPORTING
            ],
            customerId: 'demo-customer',
            version: '1.0.0',
            issuedAt: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            tier: 'pro' as const
          }
        });
      }, 500);
    });
  }

  private signPayload(payload: LicenseKeyPayload): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(payload));
    // In a real implementation, use a proper private key
    return sign.sign("your_private_key_here", 'base64');
  }

  private verifySignature(_licenseKey: string, _signature: string): boolean {
    try {
      // In a real implementation, you would verify the signature with your public key
      // This is a simplified version that always returns true for demonstration
      return true;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  private validateLicenseSync(): LicenseValidationResult {
    if (!this.licenseData) {
      return { isValid: false, error: 'No license found' };
    }
    
    // Return a default valid result for demonstration
    return {
      isValid: true,
      payload: {
        features: [Feature.BASIC_CSP_VALIDATION],
        customerId: 'demo-customer',
        version: '1.0.0',
        issuedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        tier: 'pro' as const
      }
    };
  }

  public isFeatureEnabled(feature: Feature): boolean {
    // Check if feature exists
    const featureInfo = FEATURES[feature as keyof typeof FEATURES];
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
    } else if (licenseTier === 'pro' && featureInfo.tier === 'pro') {
      // Pro tier has access to pro and free features
      return true;
    }
    
    // Free tier only has access to free features (already handled above)
    return false;
  }

  public async getLicenseInfo() {
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

  public async generateLicense(payload: Omit<LicenseKeyPayload, 'issuedAt'>): Promise<{ licenseKey: string; signature: string }> {
    // Ensure tier is set
    if (!payload.tier) {
      // Default to free tier if not specified
      payload.tier = 'free';
    }

    const completePayload: LicenseKeyPayload = {
      ...payload,
      issuedAt: new Date().toISOString(),
      tier: payload.tier || 'free' // Ensure tier is always set
    };

    const licenseKey = Buffer.from(JSON.stringify(completePayload)).toString('base64');
    const signature = this.signData(licenseKey);

    return { licenseKey, signature };
  }

  public async generateTrialLicense(tier: 'pro' | 'enterprise' = 'pro' as const): Promise<{ licenseKey: string; signature: string }> {
    // Define features based on tier
    let trialFeatures: Feature[] = [];
    
    if (tier === 'pro') {
      trialFeatures = [
        // Pro tier features
        Feature.ADVANCED_CSP_ANALYSIS,
        Feature.AUTOMATED_FIX_SUGGESTIONS,
        Feature.FULL_GITHUB_INTEGRATION,
        Feature.COMPLIANCE_REPORTING,
        // Include legacy features for backward compatibility
        Feature.ADVANCED_VULNERABILITY_SCANNING,
        Feature.AUTOMATED_REPORTING,
        Feature.TEAM_COLLABORATION,
        Feature.SCHEDULED_SCANS
      ];
    } else if (tier === 'enterprise') {
      trialFeatures = [
        // All features
        ...Object.values(Feature).filter(f => 
          typeof f === 'string' && 
          f !== Feature.BASIC_SCANNING // Skip the legacy basic scanning feature
        ) as Feature[]
      ];
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30-day trial

    const payload: Omit<LicenseKeyPayload, 'issuedAt'> = {
      features: trialFeatures,
      customerId: `trial-${tier}-${Date.now()}`,
      version: app.getVersion(),
      expiryDate: expiryDate.toISOString(),
      tier
    };

    return this.generateLicense(payload);
  }

  private signData(_data: string): string {
    // In a real implementation, you would sign the data with a private key
    // For demonstration purposes, we're just returning a hash
    return crypto.createHash('sha256').update('demo').digest('hex');
  }
}

// Export a singleton instance
export const licenseService = LicenseService.getInstance();
