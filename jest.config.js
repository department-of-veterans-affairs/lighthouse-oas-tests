module.exports = {
  testResultsProcessor: './node_modules/jest-junit-reporter',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/test/lib-test/'],
  coverageThreshold: {
    '**/*.ts': {
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/test/lib-test/'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec|integration))\\.[jt]s?$',
  testTimeout: 20000, // milliseconds
  setupFilesAfterEnv: ['<rootDir>/test/setup-tests.ts'],
};
