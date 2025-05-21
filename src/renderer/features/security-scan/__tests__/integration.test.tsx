import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityScan } from '../SecurityScan';

// Import types first to avoid circular dependencies
import type { Octokit as OctokitType } from '@octokit/rest';

// Create a mock implementation with proper typing
const createMockOctokit = () => {
  const mockOctokit = {
    repos: {
      getContent: vi.fn()
    } as unknown as OctokitType['repos'],
    auth: vi.fn(),
    request: vi.fn(),
    graphql: vi.fn(),
    log: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    },
    hook: {
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
    },
    paginate: vi.fn(),
    apps: {},
    oauthAuthorizations: {}
  } as unknown as OctokitType;

  return mockOctokit;
};

// Create a mock instance
const mockOctokit = createMockOctokit();

// Mock the Octokit module
vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => mockOctokit)
}));

// Mock the Octokit module

// Mock the SecurityScanService
vi.mock('../scan-service', () => {
  return {
    SecurityScanService: class {
      octokit: any;
      logger: any;
      scanResults: any;
      
      constructor() {
        this.octokit = mockOctokit;
        this.logger = {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn()
        };
        this.scanResults = null;
      }
      
      async startScan(options: { repository: string; branch: string; token: string }) {
        if (!options.repository || !options.token) {
          throw new Error('Repository and token are required');
        }
        return this.scanResults;
      }
      
      async scanRepository(_options: any) {
        return this.scanResults;
      }
    }
  };
});

// Import the mocked service
import { SecurityScanService } from '../scan-service';

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
  let mockScanComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create new mocks
    mockScanComplete = vi.fn();
    
    // Set up the mock implementation for getContent
    const mockGetContent = vi.fn().mockImplementation(async ({ path }: { path: string }) => ({
      data: path === '' ? [
        { type: 'dir', path: 'src' },
        { type: 'file', path: 'package.json' }
      ] : [
        { type: 'file', path: 'src/index.js' },
        { type: 'file', path: 'src/utils.js' }
      ]
    }));
    
    // Override the repos.getContent mock
    Object.defineProperty(mockOctokit.repos, 'getContent', {
      value: mockGetContent,
      configurable: true
    });
    
    // Set up mock for successful API responses
    Object.defineProperty(mockOctokit, 'request', {
      value: vi.fn().mockResolvedValue({ data: {} }),
      configurable: true
    });
    
    Object.defineProperty(mockOctokit, 'graphql', {
      value: vi.fn().mockResolvedValue({}),
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full scan flow successfully', async () => {
    // Set up mock data
    const mockResults = {
      owner: 'your-repo-owner',
      repoName: 'your-repo-name',
      repository: 'your-repo-owner/your-repo-name',
      branch: 'main',
      totalFiles: 1,
      scannedFiles: 1,
      issuesFound: 1,
      issues: [
        {
          path: 'test.txt',
          line: 1,
          severity: 'critical' as const,
          type: 'hardcoded-credential',
          description: 'Potential security issue found: hardcoded-credential'
        }
      ],
      status: 'completed' as const,
      progress: 100,
      startTime: new Date(),
      endTime: new Date(),
      error: ''
    };
    
    // Mock the startScan method to return our mock results
    const originalStartScan = SecurityScanService.prototype.startScan;
    SecurityScanService.prototype.startScan = vi.fn().mockResolvedValue(mockResults);
    
    // Mock the GITHUB_TOKEN environment variable
    const originalToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'test-token';
    
    render(<SecurityScan onScanComplete={mockScanComplete} />);

    // Start scan
    fireEvent.click(screen.getByRole('button', { name: /start scan/i }));
    
    // Wait for scan to complete
    await waitFor(() => {
      expect(mockScanComplete).toHaveBeenCalledWith(expect.objectContaining({
        repository: 'your-repo-owner/your-repo-name',
        branch: 'main',
        status: 'completed',
        issuesFound: 1
      }));
    });
    
    // Clean up
    SecurityScanService.prototype.startScan = originalStartScan;
    process.env.GITHUB_TOKEN = originalToken;
  });

  it('should handle GitHub API errors gracefully', async () => {
    // Mock API error
    const error = new Error('API Error');
    
    // Mock the startScan method to reject with an error
    const originalStartScan = SecurityScanService.prototype.startScan;
    SecurityScanService.prototype.startScan = vi.fn().mockRejectedValueOnce(error);
    
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the GITHUB_TOKEN environment variable
    const originalToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = 'test-token';

    render(<SecurityScan onScanComplete={mockScanComplete} />);

    // Start scan
    fireEvent.click(screen.getByRole('button', { name: /start scan/i }));
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Scan error:', expect.any(Error));
    });
    
    // Verify the component handles the error state by checking the button is not disabled
    const button = screen.getByRole('button', { name: /start scan/i });
    expect(button.getAttribute('disabled')).toBeNull();
    
    // Clean up
    consoleErrorSpy.mockRestore();
    SecurityScanService.prototype.startScan = originalStartScan;
    process.env.GITHUB_TOKEN = originalToken;
  });

  it('should handle missing GITHUB_TOKEN', async () => {
    // Save the original token and remove it
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Start scan
    fireEvent.click(screen.getByRole('button', { name: /start scan/i }));
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Scan error:',
        expect.any(Error)
      );
    });
    
    // Verify the error message
    const errorCall = consoleErrorSpy.mock.calls.find(call => 
      call[0] === 'Scan error:' && call[1] instanceof Error
    );
    
    expect(errorCall).toBeDefined();
    expect((errorCall as any)[1].message).toContain('GITHUB_TOKEN');
    
    // Clean up
    consoleErrorSpy.mockRestore();
    process.env.GITHUB_TOKEN = originalToken;
  });
});
