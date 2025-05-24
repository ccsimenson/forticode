// Global type declarations for the project

// Global type for the application window
interface Window {
  // Add any global window properties here
}

// Add global type declarations as needed
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    // Add other environment variables as needed
  }
}

// Add other global type declarations as needed
