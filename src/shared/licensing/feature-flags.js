"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFeatureEnabled = isFeatureEnabled;
exports.getAllFeaturesStatus = getAllFeaturesStatus;
exports.requireFeature = requireFeature;
exports.withFeature = withFeature;
exports.requiresFeature = requiresFeature;
const types_1 = require("./types");
const license_service_1 = require("./license-service");
/**
 * Check if a specific feature is enabled for the current license
 */
function isFeatureEnabled(feature) {
    return license_service_1.licenseService.isFeatureEnabled(feature);
}
/**
 * Get information about all available features and their activation status
 */
function getAllFeaturesStatus() {
    return Object.entries(types_1.FEATURES).map(([key, feature]) => ({
        id: key,
        ...feature,
        isEnabled: isFeatureEnabled(key)
    }));
}
/**
 * Require a specific feature to be enabled
 * @throws {Error} If the feature is not enabled
 */
function requireFeature(feature) {
    if (!isFeatureEnabled(feature)) {
        const featureInfo = types_1.FEATURES[feature];
        throw new Error(`This feature (${featureInfo.name}) requires a valid license. ` +
            'Please upgrade your license to access this feature.');
    }
}
/**
 * A higher-order function that only allows the wrapped function to be called
 * if the specified feature is enabled
 */
function withFeature(feature, fn) {
    return ((...args) => {
        requireFeature(feature);
        return fn(...args);
    });
}
/**
 * A decorator that can be used to protect class methods with a feature flag
 */
function requiresFeature(feature) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            requireFeature(feature);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
//# sourceMappingURL=feature-flags.js.map