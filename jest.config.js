module.exports = {
  testResultsProcessor: './node_modules/jest-junit-reporter',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/lib/"],
  coverageThreshold: {
    '**/*.ts': {
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec|integration))\\.[jt]s?$',
  testTimeout: 15000, // milliseconds
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts']
};
