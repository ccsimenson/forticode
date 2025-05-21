// Type definitions for project modules
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

// Add other module declarations as needed
