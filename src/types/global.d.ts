// Global type declarations for the project

// Declare modules for path aliases
declare module '@shared/github.service' {
  import GithubService from '../../src/shared/github.service';
  export type { GithubServiceOptions } from '../../src/shared/github.service';
  export default GithubService;
}

declare module '@renderer/utils/logger' {
  const logger: {
    info: (message: string, metadata?: any) => void;
    warn: (message: string, metadata?: any) => void;
    error: (message: string, error?: any) => void;
    debug: (message: string, metadata?: any) => void;
  };
  export default logger;
}

// Add global type declarations as needed
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    // Add other environment variables as needed
  }
}

// Add other global type declarations as needed
