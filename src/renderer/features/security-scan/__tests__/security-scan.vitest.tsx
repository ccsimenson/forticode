import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SecurityScan } from '../SecurityScan';
import { SecurityScanResult, ScanOptions } from '../scan-service';

// Add type for matchers
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T = any> {
    toBeInTheDocument(): void;
    toBeVisible(): void;
    // Add other matchers as needed
  }
}

// Extend the interface to include our test method
declare module '../scan-service' {
  interface SecurityScanService {
    _testSetScanResults?: (results: Partial<SecurityScanResult>) => void;
  }
}

// Create a test implementation of SecurityScanService
class TestSecurityScanService {
  private _testScanResults: SecurityScanResult;
  
  constructor() {
    this._testScanResults = {
      owner: '',
      repoName: '',
      repository: '',
      branch: 'main',
      totalFiles: 0,
      scannedFiles: 0,
      issuesFound: 0,
      issues: [],
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      endTime: undefined,
      error: ''
    };
  }
  
  async startScan(_options: ScanOptions): Promise<SecurityScanResult> {
    return this._testScanResults;
  }

  _testSetScanResults(results: Partial<SecurityScanResult>) {
    this._testScanResults = { ...this._testScanResults, ...results };
  }
}

// Mock the scan-service module
vi.mock('../scan-service', () => {
  // Define the mock service class inside the factory function
  class MockSecurityScanService {
    private _testScanResults: SecurityScanResult;
    
    constructor() {
      this._testScanResults = {
        owner: 'test-owner',
        repoName: 'test-repo',
        repository: 'test-owner/test-repo',
        branch: 'main',
        totalFiles: 0,
        scannedFiles: 0,
        issuesFound: 0,
        issues: [],
        status: 'pending',
        progress: 0,
        startTime: new Date(),
        endTime: undefined,
        error: ''
      };
    }
    
    async startScan(_options: ScanOptions): Promise<SecurityScanResult> {
      return this._testScanResults;
    }
    
    _testSetScanResults(results: Partial<SecurityScanResult>) {
      this._testScanResults = { ...this._testScanResults, ...results };
    }
  }
  
  const defaultScanResult: SecurityScanResult = {
    owner: 'test-owner',
    repoName: 'test-repo',
    repository: 'test-owner/test-repo',
    branch: 'main',
    totalFiles: 0,
    scannedFiles: 0,
    issuesFound: 0,
    issues: [],
    status: 'pending',
    progress: 0,
    startTime: new Date(),
    endTime: undefined,
    error: ''
  };

  const mockStartScan = vi.fn().mockImplementation(async () => ({
    ...defaultScanResult
  }));

  return {
    SecurityScanService: MockSecurityScanService,
    startScan: mockStartScan,
    // Export for test setup if needed
    _testSetScanResults: (results: Partial<SecurityScanResult>) => {
      Object.assign(defaultScanResult, results);
    }
  };
});

describe('SecurityScan', () => {
  let mockScanComplete: ReturnType<typeof vi.fn>;
  let mockSecurityScanService: TestSecurityScanService;

  beforeEach(() => {
    mockScanComplete = vi.fn();
    mockSecurityScanService = new TestSecurityScanService();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render initial state correctly', () => {
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Check that the initial UI elements are rendered
    expect(screen.getByText('Security Scan')).toBeInTheDocument();
    expect(screen.getByText('Start Scan')).toBeInTheDocument();
    expect(screen.queryByText('Scan in progress...')).not.toBeInTheDocument();
  });

  it('should show loading state during scan', async () => {
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Click the start scan button
    fireEvent.click(screen.getByText('Start Scan'));
    
    // Check that loading state is shown
    expect(await screen.findByText('Scan in progress...')).toBeInTheDocument();
  });

  it('should show scan results', async () => {
    // Set up test data
    const testResults: Partial<SecurityScanResult> = {
      owner: 'test-owner',
      repoName: 'test-repo',
      branch: 'main',
      totalFiles: 10,
      scannedFiles: 10,
      issuesFound: 2,
      status: 'completed',
      progress: 100,
      issues: [
        { 
          path: 'src/file1.js', 
          line: 10, 
          severity: 'high',
          type: 'test-rule-1',
          description: 'Test issue 1'
        },
        { 
          path: 'src/file2.js', 
          line: 20, 
          severity: 'medium',
          type: 'test-rule-2',
          description: 'Test issue 2'
        }
      ]
    };
    
    mockSecurityScanService._testSetScanResults(testResults);
    
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Start the scan
    fireEvent.click(screen.getByText('Start Scan'));
    
    // Wait for the scan to complete
    await waitFor(() => {
      expect(screen.getByText('Scan Complete')).toBeInTheDocument();
    });
    
    // Check that the results are displayed
    expect(screen.getByText('Issues Found: 2')).toBeInTheDocument();
    expect(screen.getByText('test-rule-1: Test issue 1')).toBeInTheDocument();
    expect(screen.getByText('test-rule-2: Test issue 2')).toBeInTheDocument();
  });

  it('should call onScanComplete with results when scan is complete', async () => {
    // Set up test data
    const testResults: Partial<SecurityScanResult> = {
      owner: 'test-owner',
      repoName: 'test-repo',
      branch: 'main',
      totalFiles: 5,
      scannedFiles: 5,
      issuesFound: 0,
      status: 'completed',
      progress: 100
    };
    
    mockSecurityScanService._testSetScanResults(testResults);
    
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Start the scan
    fireEvent.click(screen.getByText('Start Scan'));
    
    // Wait for the scan to complete
    await waitFor(() => {
      expect(mockScanComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          issuesFound: 0
        })
      );
    });
  });

  it('should show error message when scan fails', async () => {
    // Mock the scan to throw an error
    vi.spyOn(mockSecurityScanService, 'startScan').mockRejectedValueOnce(new Error('Scan failed'));
    
    render(<SecurityScan onScanComplete={mockScanComplete} />);
    
    // Start the scan
    fireEvent.click(screen.getByText('Start Scan'));
    
    // Check that error message is shown
    expect(await screen.findByText('Error: Scan failed')).toBeInTheDocument();
  });
});
