import SuiteFactory from '../../src/suites/suite-factory';
import PositiveSuite from '../../src/suites/positive/positive-suite';
import OasRulesetSuite from '../../src/suites/oas-ruleset/oas-ruleset-suite';
import { securityValuesAPIKeyBearerOauth } from '../fixtures/utilities/security-values';
import OASSchema from '../../src/oas-parsing/schema';

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../src/suites/oas-ruleset/validation/ruleset-wrapper', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getRuleset: jest.fn(),
    };
  };
});

const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};
const suiteConfig = {
  schema: new OASSchema(oasSchemaOptions),
  securityValues: securityValuesAPIKeyBearerOauth,
};

describe('SuiteFactory', () => {
  describe('build', () => {
    it('provides positive suite without error', () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      expect(() =>
        SuiteFactory.build(PositiveSuite.suiteId, {
          ...suiteConfig,
          options: options,
        }),
      ).not.toThrowError();
    });

    it('provides oas-ruleset suite without error', () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      expect(() =>
        SuiteFactory.build(OasRulesetSuite.suiteId, {
          ...suiteConfig,
          options: options,
        }),
      ).not.toThrowError();
    });

    it('throws error for unknown suites', () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      expect(() =>
        SuiteFactory.build('gibberishSuiteId', {
          ...suiteConfig,
          options: options,
        }),
      ).toThrowError();
    });
  });

  describe('availableSuiteIds', () => {
    it('returns array of suite IDs', () => {
      const suiteIds = SuiteFactory.availableSuiteIds();

      expect(suiteIds).toEqual([
        PositiveSuite.suiteId,
        OasRulesetSuite.suiteId,
      ]);
    });
  });
});
