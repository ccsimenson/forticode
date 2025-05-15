import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, Container } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            FortiCode - Security Auditor
          </Typography>
          <Typography variant="body1">
            Welcome to FortiCode. Start by configuring your security settings.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;