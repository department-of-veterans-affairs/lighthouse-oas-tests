import PositiveAll from '../../src/commands/positive-all';

const mockPrompt = jest.fn();
const mockExecute = jest.fn();

jest.mock('cli-ux', () => {
  return {
    cli: {
      prompt: mockPrompt,
    },
  };
});

jest.mock('', () => {
  return function (): Record<string, jest.Mock> {
    return {
      execute: mockExecute,
    };
  };
});

describe('PositiveAll', () => {
  describe('convert array of config objects to array of configs', () => {
    // Use toContain() matcher function to verify an item is in an array
    it('config array contains api key', async () => {
      const expectedApiKeyArray: Array<string> = [
        'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-a',
        'sillyFakeApiKey',
        '-s',
        'https://sandbox-westeros.dragonstone/duties/castles/{version}',
      ];
      const actualApiKeyArray = [];

      expect(actualApiKeyArray).toContainEqual(expectedApiKeyArray);
    });
    it('config array contains bearer token', async () => {
      const expectedBearerArray: Array<string> = [
        'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-b',
        'sillyFakeBearerToken',
        '-s',
        'https://sandbox-westeros.stormsend/duties/castles/{version}',
      ];
      const actualBearerArray = [];

      expect(actualBearerArray).toContainEqual(expectedBearerArray);
    });
    it('config array contains server', async () => {
      const expectedServerArray: Array<string> = [
        'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-a',
        'sillyFakeApiKey',
        '-s',
        'https://sandbox-westeros.dragonstone/duties/castles/{version}',
      ];
      const actualServerArray = [];

      expect(actualServerArray).toContainEqual(expectedServerArray);
    });
  });

  describe('loadSpecFromFile', () => {
    beforeEach(() => {
      process.env.API_KEY = 'fakeApiKey';
    });

    it('JSON file does not exist', async () => {
      await expect(async () => {
        await PositiveAll.run(['fileDoesNotExist.json']);
      }).rejects.toThrow('Unable to load json file');
    });

    it('JSON file has invalid JSON', async () => {
      await expect(async () => {
        await PositiveAll.run(['./test/fixtures/invalid.json']);
      }).rejects.toThrow('Unable to load json file');
    });

    it('Unsupported file type', async () => {
      await expect(async () => {
        await PositiveAll.run(['./test/fixtures/file.xml']);
      }).rejects.toThrow('Only file type .json is supported.');
    });
  });
});
