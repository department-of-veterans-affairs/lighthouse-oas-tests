const config = require('./jest.config');

config.testRegex = '(/__tests__/.*|(\\.|/)(e2e))\\.[jt]s?$';

module.exports = config;
