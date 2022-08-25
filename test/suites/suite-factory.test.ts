import SuiteFactory from '../../src/suites/suite-factory';
import PositiveSuite from '../../src/suites/positive/positive-suite';
import SpectralSuite from '../../src/suites/spectral/spectral-suite';
import { securityValuesAPIKeyBearerOauth } from '../fixtures/utilities/security-values';
import OASSchema from '../../src/oas-parsing/schema';

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../src/suites/spectral/validation/ruleset-wrapper', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getRuleset: jest.fn(),
    };
  };
});

describe('SuiteFactory', () => {
  describe('build', () => {
    it('provides suite without error', () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };
      const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};

      expect(() =>
        SuiteFactory.build(PositiveSuite.suiteId, {
          options: options,
          schema: new OASSchema(oasSchemaOptions),
          securityValues: securityValuesAPIKeyBearerOauth,
        }),
      ).not.toThrowError();
    });
  });

  describe('availableSuiteIds', () => {
    it('returns array of suite IDs', () => {
      const suiteIds = SuiteFactory.availableSuiteIds();

      expect(suiteIds).toEqual([PositiveSuite.suiteId, SpectralSuite.suiteId]);
    });
  });
});
