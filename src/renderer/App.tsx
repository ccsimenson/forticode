import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Typography, Paper, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { IpcChannels, CspValidationRequest, CspValidationResponse } from '@shared/ipc';
import Editor from '@monaco-editor/react';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const App: React.FC = () => {
  const [csp, setCsp] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CspValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateCsp = async () => {
    if (!csp.trim()) {
      showSnackbar('Please enter a CSP to validate', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.electron.ipcRenderer.invoke(
        IpcChannels.CSP_VALIDATE, 
        { csp } as CspValidationRequest
      ) as CspValidationResponse;
      
      setValidationResult(result);
      
      if (result.isValid) {
        showSnackbar('CSP is valid!', 'success');
      } else {
        showSnackbar(`Found ${result.errors.length} errors in CSP`, 'warning');
      }
    } catch (error) {
      console.error('Error validating CSP:', error);
      showSnackbar('Failed to validate CSP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCsp = async () => {
    setIsLoading(true);
    try {
      const generatedCsp = await window.electron.ipcRenderer.invoke(
        IpcChannels.CSP_GENERATE,
        { allowInlineScripts: false, allowEval: false }
      );
      
      setCsp(generatedCsp);
      showSnackbar('Generated a secure CSP', 'success');
    } catch (error) {
      console.error('Error generating CSP:', error);
      showSnackbar('Failed to generate CSP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box component="header" sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', p: 2, mb: 3 }}>
          <Container maxWidth="xl">
            <Typography variant="h4" component="h1">
              Electron Security Auditor
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Secure your Electron and Node.js applications with confidence
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ flex: 1, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Security Policy (CSP) Validator
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={validateCsp}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Validate CSP
              </Button>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={generateCsp}
                disabled={isLoading}
              >
                Generate Secure CSP
              </Button>
            </Box>

            <Editor
              height="200px"
              defaultLanguage="text"
              value={csp}
              onChange={(value) => setCsp(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </Paper>

          {validationResult && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Validation Results
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color={validationResult.isValid ? 'success.main' : 'error.main'}>
                  {validationResult.isValid ? '✓ Valid CSP' : '✗ Invalid CSP'}
                </Typography>
              </Box>

              {validationResult.errors.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Errors ({validationResult.errors.length}):
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          <strong>{error.directive}:</strong> {error.error}
                          {error.line && ` (Line ${error.line}${error.column ? `:${error.column}` : ''})`}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              )}

              {validationResult.warnings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Warnings ({validationResult.warnings.length}):
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          <strong>{warning.directive}:</strong> {warning.warning}
                          {warning.suggestion && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Suggestion: {warning.suggestion}
                            </Typography>
                          )}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Container>

        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto' }}>
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Electron Security Auditor - Secure your applications with confidence
            </Typography>
          </Container>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
