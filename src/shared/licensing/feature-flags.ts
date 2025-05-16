import { Feature, FEATURES } from './types';
import { licenseService } from './license-service';

/**
 * Check if a specific feature is enabled for the current license
 */
export function isFeatureEnabled(feature: Feature): boolean {
  return licenseService.isFeatureEnabled(feature);
}

/**
 * Get information about all available features and their activation status
 */
export function getAllFeaturesStatus() {
  return Object.entries(FEATURES).map(([key, feature]) => ({
    id: key,
    ...feature,
    isEnabled: isFeatureEnabled(key as Feature)
  }));
}

/**
 * Require a specific feature to be enabled
 * @throws {Error} If the feature is not enabled
 */
export function requireFeature(feature: Feature): void {
  if (!isFeatureEnabled(feature)) {
    const featureInfo = FEATURES[feature];
    throw new Error(
      `This feature (${featureInfo.name}) requires a valid license. ` +
      'Please upgrade your license to access this feature.'
    );
  }
}

/**
 * A higher-order function that only allows the wrapped function to be called
 * if the specified feature is enabled
 */
export function withFeature<T extends (...args: any[]) => any>(
  feature: Feature,
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    requireFeature(feature);
    return fn(...args);
  }) as T;
}

/**
 * A decorator that can be used to protect class methods with a feature flag
 */
export function requiresFeature(feature: Feature) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      requireFeature(feature);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
