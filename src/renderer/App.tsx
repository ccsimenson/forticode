import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  IpcChannels, 
  CspValidationRequest, 
  CspValidationResponse,
  CspValidationError,
  CspValidationWarning
} from '@shared/ipc';
import Editor from '@monaco-editor/react';

// Custom color palette
const colors = {
  primary: {
    main: '#7F00FF', // Deep Purple
    light: '#9F4FFF',
    dark: '#5C00B8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#3C40C6', // Electric Blue
    light: '#6A6FD9',
    dark: '#2A2D8C',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FFA000',
    light: '#FFC107',
    dark: '#FF8F00',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#F1F1F1',
    secondary: '#BDBDBD',
  },
};

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.5px' },
    h2: { fontWeight: 600, letterSpacing: '-0.4px' },
    h3: { fontWeight: 600, letterSpacing: '-0.3px' },
    h4: { fontWeight: 600, letterSpacing: '-0.2px' },
    h5: { fontWeight: 600, letterSpacing: '-0.1px' },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
            boxShadow: `0 4px 12px ${colors.primary.dark}80`,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          alignItems: 'center',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const appVersion = '1.0.0'; // This would typically come from package.json or environment
  const [csp, setCsp] = useState<string>('default-src \'self\'; script-src \'self\'');
  const [validationResult, setValidationResult] = useState<CspValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' | 'info' | 'warning' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    setIsElectron(window.electron !== undefined);
  }, []);

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
      if (isElectron) {
        const result = await window.electron.ipcRenderer.invoke(
          IpcChannels.CSP_VALIDATE, 
          { csp } as CspValidationRequest
        ) as CspValidationResponse;
        
        setValidationResult({
          ...result,
          // Ensure we have all required fields with proper types
          errors: result.errors || [],
          warnings: result.warnings || [],
          recommendations: result.recommendations || [],
          parsedDirectives: result.parsedDirectives || {}
        });
        
        if (result.isValid) {
          showSnackbar('CSP is valid!', 'success');
        } else {
          showSnackbar(`Found ${result.errors?.length || 0} errors in CSP`, 'warning');
        }
      } else {
        // Fallback for browser development
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setValidationResult({
          isValid: true,
warnings: [{
            directive: 'development',
            warning: 'Running in development mode with simulated validation',
            suggestion: 'Use the Electron app for full validation capabilities'
          }],
          errors: [],
          recommendations: ['Use the Electron app for full validation capabilities'],
          parsedDirectives: {
            'default-src': ["'self'"],
            'script-src': ["'self'"],
          },
        });
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

  const handleEditorChange = (value: string | undefined) => {
    setCsp(value || '');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'transparent',
      }}>
        <Box 
          component="header" 
          sx={{ 
            background: 'rgba(18, 18, 18, 0.5)',
            backdropFilter: 'blur(8px)',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 80% 20%, ${colors.primary.main}20 0%, transparent 60%)`,
              zIndex: 0,
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1.5
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                mb: 1
              }}>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800,
                    lineHeight: 1.2,
                    m: 0,
                    background: 'linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Electron Security Auditor
                </Typography>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 20,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'primary.light',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&::before': {
                        content: '""',
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                        boxShadow: `0 0 8px ${colors.primary.main}80`,
                      }
                    }}
                  >
                    v{appVersion}
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: isMobile ? '0.95rem' : '1.05rem',
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Secure your Electron and Node.js applications with comprehensive security validation and industry best practices.
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              mb: 4,
              background: 'rgba(30, 30, 30, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 12px 28px 0 ${colors.primary.main}33`,
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.secondary.main}10 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0,
                border: `1px solid ${colors.primary.main}30`
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 5V11.09C3 16.14 6.41 20.74 12 22C17.59 20.74 21 16.14 21 11.09V5L12 2ZM12 20C7.59 18.34 5 15.1 5 11.09V6.39L12 3.77L19 6.39V11.09C19 15.1 16.41 18.34 12 20Z" fill={colors.primary.main}/>
                  <path d="M12 7H11V13H12V7Z" fill={colors.primary.main}/>
                  <path d="M12 15H11V17H12V15Z" fill={colors.primary.main}/>
                </svg>
              </Box>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '40px',
                    height: '3px',
                    background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    borderRadius: '3px',
                  }
                }}
              >
                Content Security Policy Validator
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3,
                '& > *': {
                  flex: { xs: '1 1 100%', sm: '0 0 auto' },
                }
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={validateCsp}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    flex: '1',
                    py: 1.5,
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                      boxShadow: `0 4px 12px ${colors.primary.main}80`,
                    },
                  }}
                >
                  {isLoading ? 'Validating...' : 'Validate CSP'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setCsp('default-src \'self\'; script-src \'self\'')}
                  disabled={isLoading}
                  sx={{
                    flex: '1',
                    py: 1.5,
                    borderWidth: '2px',
                    color: colors.primary.light,
                    borderColor: `${colors.primary.main}80`,
                    '&:hover': {
                      borderWidth: '2px',
                      borderColor: colors.primary.main,
                      backgroundColor: `${colors.primary.main}15`,
                    },
                  }}
                >
                  Reset
                </Button>
              </Box>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={generateCsp}
                disabled={isLoading}
              >
                Generate Secure CSP
              </Button>
            </Box>

            <Box 
              sx={{ 
                height: 200, 
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                '& .monaco-editor': {
                  '--vscode-editor-background': '#1E1E1E',
                  '--vscode-editor-foreground': colors.text.primary,
                  '--vscode-editorLineNumber-foreground': '#858585',
                  '--vscode-editorLineNumber-activeForeground': colors.text.primary,
                  '--vscode-editor-selectionBackground': `${colors.primary.main}40`,
                  '--vscode-editor-cursorForeground': colors.primary.light,
                },
                '& .monaco-scrollable-element': {
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: `${colors.primary.main}40`,
                    borderRadius: '4px',
                    '&:hover': {
                      background: `${colors.primary.main}60`,
                    },
                  },
                },
              }}
            >
              <Editor
                defaultLanguage="html"
                value={csp}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'on',
                  glyphMargin: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'line',
                  scrollbar: {
                    vertical: 'hidden',
                    horizontal: 'hidden',
                  },
                }}
              />
            </Box>
          </Paper>

          {validationResult && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              mt: 3,
              background: 'rgba(30, 30, 30, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 12px 28px 0 ${colors.secondary.main}33`,
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.secondary.main}20 0%, ${colors.primary.main}10 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0,
                border: `1px solid ${colors.secondary.main}30`
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill={colors.secondary.main}/>
                  <path d="M11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill={colors.secondary.main}/>
                </svg>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h5" 
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: '40px',
                      height: '3px',
                      background: `linear-gradient(90deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
                      borderRadius: '3px',
                    }
                  }}
                >
                  Validation Results
                </Typography>
              </Box>
              <Box sx={{ 
                ml: 2,
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: 20,
                background: validationResult.isValid 
                  ? `linear-gradient(135deg, ${colors.success.main}20 0%, ${colors.success.dark}20 100%)` 
                  : `linear-gradient(135deg, ${colors.error.main}20 0%, ${colors.error.dark}20 100%)`,
                border: `1px solid ${validationResult.isValid ? colors.success.main : colors.error.main}30`,
              }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: validationResult.isValid 
                    ? `linear-gradient(135deg, ${colors.success.main} 0%, ${colors.success.light} 100%)` 
                    : `linear-gradient(135deg, ${colors.error.main} 0%, ${colors.error.light} 100%)`,
                  boxShadow: `0 0 8px ${validationResult.isValid ? colors.success.main : colors.error.main}80`,
                  mr: 1,
                }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: validationResult.isValid ? colors.success.light : colors.error.light,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {validationResult.isValid ? 'Valid' : 'Invalid'}
                </Typography>
              </Box>
            </Box>
              
              <Box sx={{ 
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: validationResult.isValid
                ? `linear-gradient(135deg, ${colors.success.main}10 0%, ${colors.success.dark}05 100%)`
                : `linear-gradient(135deg, ${colors.error.main}10 0%, ${colors.error.dark}05 100%)`,
              border: `1px solid ${validationResult.isValid ? colors.success.main : colors.error.main}20`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: validationResult.isValid
                    ? `linear-gradient(135deg, ${colors.success.main} 0%, ${colors.success.light} 100%)`
                    : `linear-gradient(135deg, ${colors.error.main} 0%, ${colors.error.light} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  flexShrink: 0,
                  '& svg': {
                    width: 14,
                    height: 14,
                    fill: '#fff',
                  }
                }}>
                  {validationResult.isValid ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                  )}
                </Box>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: validationResult.isValid ? 'success.light' : 'error.light',
                      mb: 0.5
                    }}
                  >
                    {validationResult.isValid 
                      ? 'Your CSP is valid and secure!'
                      : `Found ${validationResult.errors.length} issue${validationResult.errors.length !== 1 ? 's' : ''} in your CSP`
                    }
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.5,
                      '& a': {
                        color: 'primary.light',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }
                    }}
                  >
                    {validationResult.isValid 
                      ? 'Your Content Security Policy meets all security best practices. Keep up the good work!'
                      : 'Review the issues below and update your CSP accordingly.'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>

            {validationResult.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: 4,
                      height: 16,
                      background: `linear-gradient(to bottom, ${colors.error.main}, ${colors.secondary.main})`,
                      borderRadius: 4,
                      mr: 1.5,
                    }
                  }}
                >
                  Issues to resolve
                </Typography>
                <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                  {validationResult.errors.map((error: CspValidationError, index: number) => (
                    <Alert 
                      key={index} 
                      severity="error" 
                      sx={{ 
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        '& .MuiAlert-icon': {
                          color: 'error.light',
                          alignItems: 'flex-start',
                          pt: 1.25
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.light', mb: 0.5 }}>
                          {error.directive ? `Directive: ${error.directive}` : 'General Error'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {error.error}
                        </Typography>
                        {error.line !== undefined && error.column !== undefined && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            Line {error.line}, Column {error.column}
                          </Typography>
                        )}
                      </Box>
                    </Alert>
                  ))}
                </Box>
              </Box>
            )}

            {/* Warnings List */}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      display: 'inline-block',
                      width: 4,
                      height: 16,
                      background: `linear-gradient(to bottom, ${colors.warning.main}, ${colors.secondary.main})`,
                      borderRadius: 4,
                      mr: 1.5,
                    }
                  }}
                >
                  Recommendations
                </Typography>
                <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                  {validationResult.warnings.map((warning: CspValidationWarning, index: number) => (
                    <Alert 
                      key={index} 
                      severity="warning" 
                      sx={{ 
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        '& .MuiAlert-icon': {
                          color: 'warning.light',
                          alignItems: 'flex-start',
                          pt: 1.25
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.light', mb: 0.5 }}>
                          {warning.directive ? `Directive: ${warning.directive}` : 'Recommendation'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {warning.warning}
                        </Typography>
                        {warning.suggestion && (
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
                            Suggestion: {warning.suggestion}
                          </Typography>
                        )}
                        {warning.line !== undefined && warning.column !== undefined && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                            Line {warning.line}, Column {warning.column}
                          </Typography>
                        )}
                      </Box>
                    </Alert>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Container>
      
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto', 
          py: 3, 
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
          background: 'rgba(18, 18, 18, 0.5)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" component="p">
            {new Date().getFullYear()} Electron Security Auditor v{appVersion}
          </Typography>
          <Typography variant="caption" component="p" sx={{ mt: 1, opacity: 0.7 }}>
            Secure your Electron applications with confidence
          </Typography>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  </ThemeProvider>
  );
};

export default App;
