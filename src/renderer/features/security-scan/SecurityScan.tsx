import React, { useState } from 'react';
import { SecurityScanService } from './scan-service';
import { SecurityScanResult } from './types';
import { Button, Typography, List, Card, Box, CircularProgress } from '@mui/material';
import { SeverityColor } from '../../utils/severity-color';

interface SecurityScanProps {
  onScanComplete?: (results: SecurityScanResult) => void;
}

export const SecurityScan: React.FC<SecurityScanProps> = ({ onScanComplete }) => {
  const [scanResults, setScanResults] = useState<SecurityScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanService = new SecurityScanService();

  const startScan = async () => {
    try {
      setIsScanning(true);
      const token = process.env['GITHUB_TOKEN'];
      if (!token) {
        throw new Error('GITHUB_TOKEN environment variable is required');
      }

      const repository = 'your-repo-owner/your-repo-name';
      const branch = 'main';

      if (!repository) {
        throw new Error('Repository is required');
      }

      const results = await scanService.startScan({
        repository: repository as string,
        branch: branch as string,
        token: token as string
      });
      setScanResults(results);
      setIsScanning(false);
      
      if (onScanComplete) {
        onScanComplete(results);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setIsScanning(false);
    }
  };

  const renderScanResults = () => {
    if (!scanResults) return null;

    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scan Results
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Repository: {scanResults.repository}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Branch: {scanResults.branch}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Status: {scanResults.status}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Files scanned: {scanResults.scannedFiles}/{scanResults.totalFiles}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Issues found: {scanResults.issuesFound}
        </Typography>
        
        {scanResults.issues.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Issues
            </Typography>
            <List>
              {scanResults.issues.map(issue => (
                <Box key={issue.path} sx={{ p: 2, mb: 1, border: '1px solid #eee', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {issue.type}
                    </Typography>
                    <Typography variant="subtitle2" color={SeverityColor[issue.severity]}>
                      {issue.severity}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Path: {issue.path}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Line: {issue.line}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Description: {issue.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </List>
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Scanner
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={startScan}
          disabled={isScanning}
          startIcon={isScanning ? <CircularProgress size={20} /> : null}
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </Button>
      </Box>

      {renderScanResults()}
    </Box>
  );
};
