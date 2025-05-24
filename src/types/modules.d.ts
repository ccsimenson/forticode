// Type definitions for project modules

// GitHub module
declare module '@shared/github' {
  // Import types using type imports to avoid runtime dependencies
  import type { GitHubService as _GitHubService, GitHubServiceOptions } from '@shared/github/github.service';
  
  // Export the service class as default
  const GitHubService: typeof _GitHubService;
  export default GitHubService;
  
  // Export the options interface
  export type { GitHubServiceOptions };
  
  // Re-export all types from the types file
  export * from '@shared/github/types';
}

// Logger module
declare module '@renderer/utils/logger' {
  // Define the logger interface
  interface Logger {
    info: (message: string, metadata?: unknown) => void;
    warn: (message: string, metadata?: unknown) => void;
    error: (message: string, error?: unknown) => void;
    debug: (message: string, metadata?: unknown) => void;
  }
  
  // Export a single logger instance
  const logger: Logger;
  export default logger;
  
  // Export the Logger interface for type usage
  export type { Logger };
}
