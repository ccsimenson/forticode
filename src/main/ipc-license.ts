import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { 
  LicenseValidationResult, 
  Feature 
} from '../shared/licensing/types';
import { licenseService } from '../shared/licensing/license-service';

export function setupLicenseIpcHandlers() {
  // Activate a license
  ipcMain.handle('license:activate', async (_event: IpcMainInvokeEvent, licenseKey: string) => {
    return await licenseService.activateLicense(licenseKey);
  });

  // Deactivate the current license
  ipcMain.handle('license:deactivate', async () => {
    await licenseService.deactivateLicense();
    return { success: true };
  });

  // Get current license info
  ipcMain.handle('license:info', async () => {
    return await licenseService.getLicenseInfo();
  });

  // Validate the current license
  ipcMain.handle('license:validate', async (): Promise<LicenseValidationResult> => {
    return await licenseService.validateLicense();
  });

  // Check if a feature is enabled
  ipcMain.handle(
    'license:isFeatureEnabled', 
    (_event: IpcMainInvokeEvent, feature: Feature) => {
      return licenseService.isFeatureEnabled(feature);
    }
  );

  // Get status of all features
  ipcMain.handle('license:getAllFeatures', () => {
    const { getAllFeaturesStatus } = require('../shared/licensing/feature-flags');
    return getAllFeaturesStatus();
  });
}

// Re-export types for use in the renderer process
export type { 
  LicenseKeyPayload, 
  LicenseValidationResult, 
  Feature 
} from '../shared/licensing/types';

export { 
  licenseService 
} from '../shared/licensing/license-service';
