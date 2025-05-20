// Mock implementation of GithubService
class MockGithubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Mock methods that are used in the tests
  async getRepoContent(options: any): Promise<any> {
    return [];
  }

  async getFileContent(options: any): Promise<string> {
    return '';
  }
}

export default MockGithubService;
