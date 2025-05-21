// Export types
export * from './types';

// Export the GitHub service and its options
import GitHubService from './github.service';
import type { GitHubServiceOptions } from './github.service';

export { GitHubService };
export type { GitHubServiceOptions };

// Export webhook handler
export * from './webhook-handler';

// Export auth utilities
export * from './github-auth';

// Export config
export * from './config';


// Export default
export default GitHubService;
