import { app } from 'electron';
import { setupLicenseIpcHandlers } from './ipc-license';

export function setupLicenseHandlers() {
  // Setup IPC handlers for license management
  setupLicenseIpcHandlers();
  
  // Validate license on app start
  app.whenReady().then(async () => {
    try {
      const { licenseService } = require('../shared/licensing/license-service');
      const result = await licenseService.validateLicense();
      
      if (!result.isValid) {
        console.warn('No valid license found or license validation failed:', result.error);
      } else {
        console.log('License validated successfully');
      }
    } catch (error) {
      console.error('Error during license validation:', error);
    }
  });
  
  // Add license validation for all windows
  app.on('browser-window-created', (_, window) => {
    // You can add additional window-specific license checks here
    window.webContents.on('did-finish-load', () => {
      // Inject license status into the renderer context if needed
    });
  });
}

// Re-export types for convenience
export * from './ipc-license';
