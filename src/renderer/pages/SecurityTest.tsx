import React from 'react';
import SecurityScanResults from '../components/security/SecurityScanResults';
import { useNavigate } from 'react-router-dom';

const SecurityTest: React.FC = () => {
    const navigate = useNavigate();
    const [showResults, setShowResults] = React.useState(false);

    const handleScanComplete = (results: any) => {
        console.log('Scan completed:', results);
        setShowResults(true);
    };

    return (
        <div className="container">
            <h1>Security Scanner Test</h1>
            <p>This page demonstrates the security scanning functionality. The scanner will automatically run when the page loads.</p>

            <div className="security-test-container">
                <button className="primary-button" onClick={() => setShowResults(false)}>
                    Run New Scan
                </button>
                
                <button className="secondary-button" onClick={() => navigate('/')} >
                    Back to Home
                </button>

                {showResults && (
                    <div className="scan-results-container">
                        <SecurityScanResults onScanComplete={handleScanComplete} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityTest;
