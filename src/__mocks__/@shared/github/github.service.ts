import { vi } from 'vitest';

// Mock implementation of the GitHub service
export class MockGitHubService {
  getContents = vi.fn().mockResolvedValue([]);
  getFileContent = vi.fn().mockResolvedValue('');
  request = vi.fn().mockResolvedValue({});
}

// Create a default instance for convenience
export const mockGitHubService = new MockGitHubService();

// Default export for the mock module
export default mockGitHubService;
