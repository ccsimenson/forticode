// Global type declarations for the project

// Declare modules for path aliases
declare module '@shared/github' {
  import { GitHubService } from '../../shared/github/github.service';
  export * from '../../shared/github/types';
  export { GitHubService, GitHubServiceOptions } from '../../shared/github/github.service';
  export { GitHubService as default };
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
