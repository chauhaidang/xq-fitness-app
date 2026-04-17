// Jest configuration for Detox E2E tests — uses xq-test-utils wrapper (e2e-config skill)
// Internally sets: testEnvironment (detox), testRunner (jest-circus),
// maxWorkers (1), transform (ts-jest), testTimeout (120s)
const { createE2eJestConfig } = require('@chauhaidang/xq-test-utils');

module.exports = createE2eJestConfig({
  testMatch: ['<rootDir>/**/*.e2e.ts'],
  setupFilePath: '<rootDir>/setup.ts',
  tsconfigPath: '<rootDir>/tsconfig.json',
});
