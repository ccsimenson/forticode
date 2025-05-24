import { GitHubAppConfig } from './types';
/**
 * Creates a GitHub authentication instance
 */
export declare function createGithubAuth(_config: GitHubAppConfig): {
    getToken(): Promise<string>;
    refreshToken(): Promise<string>;
    getInstallationId(_owner: string, _repo: string): Promise<number | null>;
};
//# sourceMappingURL=github-auth.d.ts.map