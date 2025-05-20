import React, { useState, useEffect } from 'react';
import { SecurityScanResult } from '../../../shared/security/types';
import { SecurityUtils } from '../../../shared/security/security-utils';

interface SecurityScanResultsProps {
    onScanComplete?: (results: SecurityScanResult) => void;
}

const SecurityScanResults: React.FC<SecurityScanResultsProps> = ({ onScanComplete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [scanResults, setScanResults] = useState<SecurityScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const runScan = async () => {
            try {
                setIsLoading(true);
                const scanner = await import('../../../shared/security/security-scanner');
                const results = await scanner.SecurityScanner.getInstance().runFullScan();
                setScanResults(results);
                if (onScanComplete) {
                    onScanComplete(results as SecurityScanResult);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred during the scan');
            } finally {
                setIsLoading(false);
            }
        };

        runScan();
    }, [onScanComplete]);

    const getCheckStatusColor = (status: string) => {
        switch (status) {
            case 'PASS':
                return 'text-green-600';
            case 'FAIL':
                return 'text-red-600';
            case 'ERROR':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASS':
                return '✅';
            case 'FAIL':
                return '❌';
            case 'ERROR':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Running security scan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600">
                <p>❌ Error: {error}</p>
            </div>
        );
    }

    if (!scanResults) {
        return null;
    }

    const score = SecurityUtils.getSecurityScore(scanResults);
    const scoreColor = score >= 80 ? 'bg-green-100 text-green-800' :
                      score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800';

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Security Scan Results</h2>
                <p className="text-gray-600">Last scan: {new Date(scanResults.timestamp).toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">Security Score</div>
                    <div className={`px-4 py-2 rounded-full ${scoreColor} font-bold`}>
                        {score}%
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {scanResults.checks.map((check, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{check.name}</h3>
                            <span className={`font-bold ${getCheckStatusColor(check.status)}`}>
                                {getStatusIcon(check.status)} {check.status}
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            {check.result.details && typeof check.result.details === 'object' && (
                                Object.entries(check.result.details).map(([key, value]) => (
                                    <div key={key} className="flex items-start space-x-4">
                                        <span className="font-medium w-40">{key}:</span>
                                        <div className="flex-1">
                                            {value && typeof value === 'object' && !Array.isArray(value) ? (
                                                <ul className="list-disc list-inside">
                                                    {Object.entries(value).map(([subKey, subValue]) => (
                                                        <li key={subKey} className="flex items-center space-x-2">
                                                            <span className="font-medium">{subKey}:</span>
                                                            <span>{String(subValue)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span>{String(value)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecurityScanResults;
