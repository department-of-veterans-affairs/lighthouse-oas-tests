import SuiteFactory from '../../src/suites/suite-factory';
import PositiveSuite from '../../src/suites/positive/positive-suite';
import OASSchema from '../../src/oas-parsing/schema';

jest.mock('../../src/suites/positive/positive-suite', () => {
  return function (): Record<string, jest.Mock> {
    return {
      setup: jest.fn(),
      conduct: jest.fn(),
    };
  };
});

const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};
const suiteConfig = {
  schema: new OASSchema(oasSchemaOptions),
};

describe('SuiteFactory', () => {
  describe('build', () => {
    it('provides positive suite without error', async () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      await expect(
        SuiteFactory.build(PositiveSuite.suiteId, {
          ...suiteConfig,
          options: options,
        }),
      ).resolves.not.toThrow();
    });

    it('provides oas-ruleset suite without error', async () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      await expect(
        SuiteFactory.build('oas-ruleset', {
          ...suiteConfig,
          options: options,
        }),
      ).resolves.not.toThrow();
    });

    it('throws error for unknown suites', async () => {
      const options = { path: 'fake-path', apikey: 'fake-key' };

      await expect(
        SuiteFactory.build('gibberishSuiteId', {
          ...suiteConfig,
          options: options,
        }),
      ).rejects.toThrowError(`Unable to find suite with ID gibberishSuiteId`);
    });
  });

  describe('availableSuiteIds', () => {
    it('returns array of suite IDs', () => {
      const suiteIds = SuiteFactory.availableSuiteIds();

      expect(suiteIds).toEqual(
        expect.arrayContaining([
          PositiveSuite.suiteId,
          'oas-ruleset',
          'lighthouseAPIStandards',
        ]),
      );
    });
  });
});
