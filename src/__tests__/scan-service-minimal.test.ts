import { SecurityScanService } from '@renderer/features/security-scan/scan-service';
import { ScanOptions } from '@renderer/features/security-scan/types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock logger
vi.mock('@renderer/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock GitHub service
const mockGithubService = {
  getContents: vi.fn(),
  getFileContent: vi.fn()
};

vi.mock('@shared/github.service', () => ({
  default: vi.fn(() => mockGithubService)
}));

describe('SecurityScanService', () => {
  let service: SecurityScanService;
  
  const testOptions: ScanOptions = {
    owner: 'test-owner',
    repo: 'test-repo',
    token: 'test-token',
    branch: 'main'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a new instance of the service for each test
    service = new SecurityScanService();
    
    // Set up default mock implementations
    mockGithubService.getContents.mockResolvedValue({
      data: []
    });
    
    mockGithubService.getFileContent.mockResolvedValue({
      content: 'dGVzdCBjb250ZW50' // 'test content' in base64
    });
  });

  describe('startScan', () => {
    it('should throw an error if repository or token is missing', async () => {
      const options = {
        owner: '',
        repo: 'test-repo',
        token: '',
        branch: 'main'
      } as ScanOptions;

      await expect(service.startScan(options)).rejects.toThrow('Repository and token are required');
    });
    
    it('should start a scan with valid options', async () => {
      // Arrange
      const options = { ...testOptions };
      
      // Act
      const result = await service.startScan(options);
      
      // Assert
      expect(result).toBeDefined();
      expect(mockGithubService.getContents).toHaveBeenCalled();
    });

    it('should handle errors during scanning', async () => {
      // Arrange
      const error = new Error('Failed to scan repository');
      mockGithubService.getContents.mockRejectedValueOnce(error);
      
      // Act & Assert
      await expect(service.startScan(testOptions)).rejects.toThrow('Failed to scan repository');
    });
  });
});
