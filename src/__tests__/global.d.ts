// Type definitions for test files

// Mock modules for testing
declare module '@shared/github.service' {
  const mockGithubService: {
    new (token: string): any;
    // Add any methods that are used in the tests
  };
  export default mockGithubService;
}

declare module '@renderer/utils/logger' {
  const logger: {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    debug: jest.Mock;
  };
  export default logger;
}

// Add global test types
declare namespace NodeJS {
  interface Global {
    // Add any global test utilities or mocks here
  }
}

// Add Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add any custom matchers here
    }
  }
}
