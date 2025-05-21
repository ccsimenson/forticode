// Type definitions for test files

// Mock modules for testing
declare module '@shared/github.service' {
  const mockGithubService: {
    new (token: string): any;
    // Add any methods that are used in the tests
  };
  export default mockGithubService;
}

// Mock logger
declare const logger: {
  info: Vi.Mock;
  warn: Vi.Mock;
  error: Vi.Mock;
  debug: Vi.Mock;
};

// Add global test types
declare namespace NodeJS {
  interface Global {
    logger: typeof logger;
  }
}

// Add Vitest matchers
declare namespace Vi {
  interface Matchers<R> {
    toBeWithinRange(a: number, b: number): R;
  }
}
