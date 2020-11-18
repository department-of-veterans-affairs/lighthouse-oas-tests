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
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec|integration))\\.[jt]sx?$',
};