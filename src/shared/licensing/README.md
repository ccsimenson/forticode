# Licensing System

This module provides a flexible and secure licensing system for the Electron Security Auditor application. It allows for feature gating based on license levels and includes utilities for validating and managing licenses.

## Features

- License key validation and verification
- Feature-based access control
- Support for time-limited licenses
- Machine-specific activation
- Secure license storage
- React hooks and components for easy integration

## Usage

### Checking if a Feature is Enabled

```typescript
import { isFeatureEnabled, Feature } from './licensing/feature-flags';

if (isFeatureEnabled(Feature.ADVANCED_VULNERABILITY_SCANNING)) {
  // Execute premium feature
} else {
  // Show upgrade prompt or limited functionality
}
```

### Using the FeatureGate Component

```tsx
import { FeatureGate, Feature } from './licensing/feature-flags';

function MyComponent() {
  return (
    <div>
      <h1>My Premium Feature</h1>
      <FeatureGate 
        feature={Feature.ADVANCED_VULNERABILITY_SCANNING}
        fallback={
          <div className="upgrade-prompt">
            Upgrade to access this premium feature!
          </div>
        }
      >
        <PremiumFeatureComponent />
      </FeatureGate>
    </div>
  );
}
```

### Using the useLicense Hook

```tsx
import { useLicense, Feature } from '../hooks/useLicense';

function LicenseStatus() {
  const { 
    licenseInfo, 
    isFeatureEnabled, 
    hasActiveLicense,
    activateLicense,
    deactivateLicense 
  } = useLicense();

  // ...
}
```

### License Management UI

A pre-built `LicenseManager` component is available for managing licenses:

```tsx
import LicenseManager from '../components/LicenseManager';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <LicenseManager />
    </div>
  );
}
```

## License Service API

The `LicenseService` class provides the following methods:

- `activateLicense(licenseKey: string): Promise<LicenseValidationResult>` - Activate a license
- `deactivateLicense(): Promise<void>` - Deactivate the current license
- `validateLicense(): Promise<LicenseValidationResult>` - Validate the current license
- `isFeatureEnabled(feature: Feature): boolean` - Check if a feature is enabled
- `getLicenseInfo(): Promise<LicenseInfo | null>` - Get current license information

## Security Considerations

- License keys are validated against a public key
- License data is stored securely in the user's application data directory
- Machine-specific identifiers prevent license sharing between devices
- All license validations are performed in the main process

## Adding New Features

1. Add the feature to the `Feature` enum in `types.ts`
2. Define the feature's metadata in the `FEATURES` constant
3. Use the `isFeatureEnabled` function or `FeatureGate` component to control access

## Testing

To test the licensing system in development, you can use the following test license key:
`TEST-1234-5678-9012`

This will activate all premium features in development mode.
