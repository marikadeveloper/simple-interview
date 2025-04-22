/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        // Add ts-jest specific options
        diagnostics: {
          ignoreCodes: [151001], // Optional: ignore specific TS diagnostic codes if needed
          pretty: true,
          warnOnly: true, // Report TS errors as warnings, don't fail the test run
        },
      },
    ],
  },
  globalSetup: './src/test-utils/setup.ts',
  globalTeardown: './src/test-utils/teardown.ts',
  forceExit: true,
  testMatch: [
    // Add this block to explicitly define test file locations
    '<rootDir>/src/**/*.test.ts',
  ],
};
