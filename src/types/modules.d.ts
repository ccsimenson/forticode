// Type definitions for project modules
declare module '@shared/github.service' {
  import GithubService from '../../../src/shared/github.service';
  export type { GithubServiceOptions } from '../../../src/shared/github.service';
  export type { GitHubFileContent, GitHubFileInfo } from '../../../src/shared/github.service';
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

// Add other module declarations as needed
