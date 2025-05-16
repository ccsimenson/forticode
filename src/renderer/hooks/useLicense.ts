import * as React from 'react';
import { Feature } from '../../shared/licensing/types';

export { Feature };

interface LicenseInfo {
  licenseKey: string;
  customerId: string;
  features: string[];
  expiryDate?: string;
  issuedAt: string;
  lastValidated: string;
}

// Custom hook for license management
export function useLicense() {
  const [licenseInfo, setLicenseInfo] = React.useState<LicenseInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [features, setFeatures] = React.useState<Record<string, any>>({});

  const loadLicenseInfo = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get license info
      const info = await window.electron.ipcRenderer.invoke('license:info');
      setLicenseInfo(info);
      
      // Get all features status
      const allFeatures = await window.electron.ipcRenderer.invoke('license:getAllFeatures');
      const featuresMap = allFeatures.reduce((acc: Record<string, any>, feature: any) => {
        acc[feature.id] = feature;
        return acc;
      }, {});
      
      setFeatures(featuresMap);
      return info;
    } catch (err) {
      console.error('Failed to load license info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load license information');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateLicense = React.useCallback(async (licenseKey: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await window.electron.ipcRenderer.invoke('license:activate', licenseKey);
      
      if (result.isValid) {
        await loadLicenseInfo();
      }
      
      return result;
    } catch (err) {
      console.error('License activation failed:', err);
      setError(err instanceof Error ? err.message : 'License activation failed');
      return { 
        isValid: false, 
        error: err instanceof Error ? err.message : 'License activation failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadLicenseInfo]);

  const deactivateLicense = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await window.electron.ipcRenderer.invoke('license:deactivate');
      await loadLicenseInfo();
      
      return { success: true };
    } catch (err) {
      console.error('License deactivation failed:', err);
      setError(err instanceof Error ? err.message : 'License deactivation failed');
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'License deactivation failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadLicenseInfo]);

  const isFeatureEnabled = React.useCallback((feature: Feature): boolean => {
    return features[feature]?.isEnabled || false;
  }, [features]);

  // Load license info on mount
  React.useEffect(() => {
    loadLicenseInfo();
  }, [loadLicenseInfo]);

  return {
    // State
    licenseInfo,
    isLoading,
    error,
    features,
    
    // Actions
    activateLicense,
    deactivateLicense,
    refresh: loadLicenseInfo,
    isFeatureEnabled,
    
    // Derived state
    hasActiveLicense: !!licenseInfo,
    isTrial: false, // You can implement trial logic if needed
  };
}

// Higher-order component for class components
type WithFeatureGateOptions = {
  feature: Feature;
  FallbackComponent?: React.ComponentType<unknown>;
};

// A simplified implementation of withFeatureGate
export function withFeatureGate<Props extends object = Record<string, unknown>>(
  WrappedComponent: React.ComponentType<Props>,
  options: WithFeatureGateOptions | Feature
): React.ComponentType<Props> {
  // Create the wrapped component
  function WrappedWithFeature(props: Props) {
    // Extract feature from options
    const feature = typeof options === 'object' ? options.feature : options;
    
    // Get the fallback component or use a default one
    const Fallback = 
      typeof options === 'object' && options.FallbackComponent 
        ? options.FallbackComponent 
        : (() => null) as React.ComponentType<unknown>;

    const { isFeatureEnabled, isLoading } = useLicense();
    
    if (isLoading) {
      return React.createElement(React.Fragment, null);
    }
    
    if (!isFeatureEnabled(feature)) {
      return React.createElement(Fallback, null);
    }
    
    return React.createElement(WrappedComponent, props);
  }

  // Set display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WrappedWithFeature.displayName = `withFeatureGate(${displayName})`;

  return WrappedWithFeature;
}

// Feature component that only renders if the feature is enabled
export interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  children,
  fallback = null
}: FeatureGateProps): React.ReactElement | null {
  const { isFeatureEnabled, isLoading } = useLicense();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  // Use the fallback component if the feature is not enabled
  const content = isFeatureEnabled(feature) ? children : fallback;
  return React.createElement(React.Fragment, null, content || null);
}
