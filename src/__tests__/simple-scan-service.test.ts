import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the @octokit/rest module before any imports
vi.mock('@octokit/rest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@octokit/rest')>();
  
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
      this.options = options;
      console.log('MockOctokit created with options:', options);
    }
  }
  
  return {
    ...actual,
    Octokit: MockOctokit,
  };
});

// Import the service after setting up mocks
import { SecurityScanService } from '../renderer/features/security-scan/scan-service';

describe('Simple SecurityScanService Test', () => {
  // Store the original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up test environment
    process.env = { ...originalEnv, GITHUB_TOKEN: 'test-token' };
  });

  afterEach(() => {
    // Restore the original environment
    process.env = originalEnv;
  });

  it('should create an instance', () => {
    console.log('Starting test...');
    const service = new SecurityScanService();
    console.log('Service created');
    expect(service).toBeDefined();
    console.log('Test completed');
  });
});
