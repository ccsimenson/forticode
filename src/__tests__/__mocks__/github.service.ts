// Mock implementation of GithubService
class MockGithubService {
  // Token parameter is accepted but not used in the mock
  constructor(_token: string) {}

  // Mock methods that are used in the tests
  async getRepoContent(_options: unknown): Promise<unknown[]> {
    return [];
  }

  async getFileContent(_options: unknown): Promise<string> {
    return '';
  }
}

export default MockGithubService;
