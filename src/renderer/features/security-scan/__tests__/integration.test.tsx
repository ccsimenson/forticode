import { vi } from 'vitest';

// Mock the @octokit/rest module before any imports
vi.mock('@octokit/rest', () => {
  // Create a mock Octokit class with all required methods
  class MockOctokit {
    options: any;
    request = vi.fn();
    graphql = vi.fn();
    log = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    hook = {
      wrap: vi.fn((_event: string, callback: () => any) => callback()),
      before: vi.fn(),
      after: vi.fn(),
      error: vi.fn(),
      remove: vi.fn(),
      prepend: vi.fn(),
      on: vi.fn(),
      addListener: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      removeListener: vi.fn(),
      emit: vi.fn(),
      listenerCount: vi.fn(),
      listeners: vi.fn(),
      rawListeners: vi.fn(),
      eventNames: vi.fn()
    };
    auth = vi.fn();
    repos = {
      getContent: vi.fn()
    };
    paginate = vi.fn();
    apps = {};
    oauthAuthorizations = {};
    
    constructor(options: any) {
      // Store options if needed for assertions
      this.options = options;
    }
  }
  
  return {
    Octokit: MockOctokit,
  };
});

// Create a mock instance of Octokit
const mockOctokit = new (require('@octokit/rest').Octokit)({
  auth: 'test-token'
});

// Export the mock for use in tests
export { mockOctokit };

import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SecurityScan } from '../SecurityScan';
import { SecurityScanService, SecurityScanResult } from '../scan-service';

// Mock logger
vi.mock('@renderer/utils/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock environment
process.env['GITHUB_TOKEN'] = 'test-token';

describe('Security Scan Integration', () => {
  let mockSecurityScanService: SecurityScanService;
  let mockScanComplete: jest.Mock;

  beforeEach(() => {
    mockScanComplete = jest.fn();
    mockSecurityScanService = new SecurityScanService();
    // Use type assertion to bypass TypeScript's private property check
    (mockSecurityScanService as any).octokit = mockOctokit;
    
    // Mock Octokit responses
    (mockOctokit.repos.getContent as jest.Mock).mockImplementation(async ({ path }: { path: string }) => ({
      data: path === '' ? [
        { type: 'dir', path: 'src' },
        { type: 'file', path: 'test.txt', content: 'password=test\napi_key=123' }
      ] : {
        content: 'password=test\napi_key=123'
      }
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full scan flow successfully', async () => {
    // Mock scan results
    const mockResults: SecurityScanResult = {
      repository: 'test/repo',
      branch: 'main',
      owner: 'test',
      repoName: 'repo',
      totalFiles: 1,
      scannedFiles: 1,
      issuesFound: 2,
      issues: [
        {
          path: 'test.txt',
          line: 1,
          severity: 'critical',
          type: 'hardcoded-credential',
          description: 'Potential security issue found: hardcoded-credential'
        },
        {
          path: 'test.txt',
          line: 2,
          severity: 'critical',
          type: 'hardcoded-credential',
          description: 'Potential security issue found: hardcoded-credential'
        }
      ],
      status: 'completed',
      progress: 100,
      startTime: new Date(),
      endTime: new Date(),
      error: ''
    };

    // Mock startScan
    jest.spyOn(mockSecurityScanService, 'startScan').mockResolvedValue(mockResults);

    render(<SecurityScan onScanComplete={mockScanComplete} />);

    // Start scan
    fireEvent.click(screen.getByText('Start Scan'));

    // Wait for scan to complete
    await waitFor(() => {
      expect(mockSecurityScanService.startScan).toHaveBeenCalled();
    });

    // Verify results
    expect(screen.getByText('Scan Results')).toBeInTheDocument();
    expect(screen.getByText('Repository: test/repo')).toBeInTheDocument();
    expect(screen.getByText('Issues found: 2')).toBeInTheDocument();
    expect(screen.getByText('Path: test.txt')).toBeInTheDocument();
    expect(mockScanComplete).toHaveBeenCalledWith(mockResults);
  });

  it('should handle GitHub API errors gracefully', async () => {
    // Mock API error
    (mockOctokit.repos.getContent as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<SecurityScan onScanComplete={mockScanComplete} />);

    // Start scan
    fireEvent.click(screen.getByText('Start Scan'));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    // Verify error state
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should handle invalid repository format', async () => {
    // Mock invalid repository
    mockSecurityScanService['scanResults'] = {
      repository: 'invalid-format',
      branch: 'main',
      owner: '',
      repoName: '',
      totalFiles: 0,
      scannedFiles: 0,
      issuesFound: 0,
      issues: [],
      status: 'error',
      progress: 0,
      startTime: new Date(),
      endTime: new Date(),
      error: 'Invalid repository format'
    };

    render(<SecurityScan onScanComplete={mockScanComplete} />);

    // Start scan
    fireEvent.click(screen.getByText('Start Scan'));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Invalid repository format')).toBeInTheDocument();
    });
  });
});
