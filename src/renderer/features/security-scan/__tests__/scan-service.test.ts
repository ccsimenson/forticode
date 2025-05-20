import { SecurityScanService } from '../scan-service';
import { ScanOptions } from '../types';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock logger
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

vi.mock('@renderer/utils/logger', () => ({
  default: mockLogger
}));

// Mock GithubService
const mockGithubService = {
  getContents: vi.fn().mockResolvedValue({
    data: [
      {
        sha: 'test-sha',
        size: 100,
        content: 'test-content',
        path: 'test-file.txt',
        type: 'file'
      }
    ]
  }),
  getFileContent: vi.fn().mockResolvedValue('test file content')
};

vi.mock('@shared/github.service', () => ({
  default: vi.fn(() => mockGithubService)
}));

// Import after mocks are set up
import GithubService from '@shared/github.service';

// Test data
class TestSecurityScanService extends SecurityScanService {
  getScanResults() {
    return this.scanResults;
  }
}

describe('SecurityScanService', () => {
  let service: TestSecurityScanService;
  const mockOptions: ScanOptions = {
    owner: 'test-owner',
    repo: 'test-repo',
    branch: 'main',
    token: 'test-token'
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create a fresh service instance for each test
    service = new TestSecurityScanService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startScan', () => {
    it('should throw error when required options are missing', async () => {
      await expect(service.startScan({} as ScanOptions)).rejects.toThrow('Repository and token are required');
    });

    it('should throw error when repository format is invalid', async () => {
      await expect(service.startScan({ owner: '', repo: '', token: 'test' } as ScanOptions))
        .rejects.toThrow('Invalid repository format');
    });

    it('should initialize GithubService with provided token', async () => {
      await service.startScan(mockOptions);
      
      expect(GithubService).toHaveBeenCalledWith(mockOptions.token);
      expect(mockGithubService.getContents).toHaveBeenCalledWith({
        owner: mockOptions.owner,
        repo: mockOptions.repo,
        ref: mockOptions.branch
      });
    });

    it('should update scan results with progress', async () => {
      await service.startScan(mockOptions);
      
      const results = service.getScanResults();
      expect(results.progress).toBeGreaterThan(0);
      expect(results.status).toBe('running');
    });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const results = service.getScanResults();
      expect(results).toBeDefined();
      expect(results.status).toBe('pending');
      expect(results.progress).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should log errors and update scan results', async () => {
      const error = new Error('API error');
      mockGithubService.getContents.mockRejectedValueOnce(error);
      
      await service.startScan(mockOptions);
      
      expect(mockLogger.error).toHaveBeenCalledWith('Error during security scan:', error);
      const results = service.getScanResults();
      expect(results.status).toBe('error');
      expect(results.error).toBe('API error');
    });
  });
});
