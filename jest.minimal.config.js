module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@renderer/(.*)$': '<rootDir>/src/renderer/$1',
  },
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false,
  // Setup for ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|fetch-blob|@octokit/.*|@testing-library/.*|@babel/runtime/helpers/esm/|universal-user-agent|before-after-hook))',
  ],
  extensionsToTreatAsEsm: ['.ts'],
};
