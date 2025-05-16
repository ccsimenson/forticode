import React, { useState } from 'react';
import { useLicense, Feature } from '../hooks/useLicense';

const LicenseManager: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationMessage, setActivationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const {
    licenseInfo,
    isLoading,
    error,
    features,
    activateLicense,
    deactivateLicense,
    hasActiveLicense,
    isFeatureEnabled,
  } = useLicense();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    
    setIsActivating(true);
    setActivationMessage(null);
    
    try {
      const result = await activateLicense(licenseKey);
      
      if (result.isValid) {
        setActivationMessage({
          type: 'success',
          message: 'License activated successfully!',
        });
        setLicenseKey('');
      } else {
        setActivationMessage({
          type: 'error',
          message: result.error || 'Invalid license key',
        });
      }
    } catch (err) {
      setActivationMessage({
        type: 'error',
        message: 'An error occurred while activating the license',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this license?')) {
      const { error } = await deactivateLicense();
      
      if (error) {
        setActivationMessage({
          type: 'error',
          message: error,
        });
      } else {
        setActivationMessage({
          type: 'success',
          message: 'License deactivated successfully',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">License Management</h1>
      
      {activationMessage && (
        <div className={`mb-6 p-4 rounded ${
          activationMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {activationMessage.message}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {hasActiveLicense ? 'Active License' : 'Activate License'}
        </h2>
        
        {hasActiveLicense ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Customer ID</p>
                <p className="font-medium">{licenseInfo?.customerId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expires</p>
                <p className="font-medium">
                  {licenseInfo?.expiryDate 
                    ? new Date(licenseInfo.expiryDate).toLocaleDateString() 
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issued On</p>
                <p className="font-medium">
                  {licenseInfo?.issuedAt 
                    ? new Date(licenseInfo.issuedAt).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Validated</p>
                <p className="font-medium">
                  {licenseInfo?.lastValidated 
                    ? new Date(licenseInfo.lastValidated).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={isActivating}
            >
              {isActivating ? 'Deactivating...' : 'Deactivate License'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your license key
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="licenseKey"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isActivating}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!licenseKey.trim() || isActivating}
                >
                  {isActivating ? 'Activating...' : 'Activate'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Don't have a license key?{' '}
              <a href="#" className="text-blue-600 hover:underline">Get a license</a>
            </p>
          </form>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="space-y-4">
          {Object.entries(Feature).map(([key, featureKey]) => {
            const feature = features[featureKey as Feature];
            const isEnabled = isFeatureEnabled(featureKey as Feature);
            
            return (
              <div 
                key={featureKey} 
                className={`p-4 border rounded-lg ${
                  isEnabled 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{feature?.name || key}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature?.description || 'No description available'}
                    </p>
                  </div>
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {feature?.requiresLicense && !isEnabled && (
                  <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                    This is a premium feature. Upgrade your license to enable it.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LicenseManager;
