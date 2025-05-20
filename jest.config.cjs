module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed from 'node' to 'jsdom' for React component testing
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/src/__tests__/tsconfig.json',
      // Add these for better ES module support
      useESM: true,
      babelConfig: {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@renderer/(.*)$': '<rootDir>/src/renderer/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@utils/(.*)$': '<rootDir>/src/renderer/utils/$1',
    '^@features/(.*)$': '<rootDir>/src/renderer/features/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    // Map relative imports to work from test files
    '^\\.\\./\\.\\./shared/(.*)$': '<rootDir>/src/shared/$1',
    '^\\.\\./\\.\\./utils/(.*)$': '<rootDir>/src/renderer/utils/$1',
    // Add mocks for Node.js modules and other dependencies
    '^@octokit/rest$': '<rootDir>/__mocks__/octokit-rest.ts',
    // Mock implementations for our modules
    '^@shared/github.service$': '<rootDir>/src/__tests__/__mocks__/github.service.ts',
    '^@renderer/utils/logger$': '<rootDir>/src/__tests__/__mocks__/logger.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  // Add transformIgnorePatterns for node_modules that need to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|@octokit/rest|@octokit/.*)/)',
  ],
  // Add test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};