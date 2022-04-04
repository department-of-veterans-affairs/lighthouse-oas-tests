import Positive from '../../src/commands/positive';
import PositiveAll from '../../src/commands/positive-all';

describe('PositiveAll', () => {
  beforeEach(() => {
    Positive.run = jest.fn();
  });

  describe('convert array of config objects to array of configs', () => {
    it('config array contains api key, bearer token and server flags & paths', async () => {
      const expectedApiKeyArray: Array<string> = [
        'https://westeros.kingslanding/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-a',
        'sillyFakeApiKey',
        '-s',
        'https://sandbox-westeros.kingslanding/duties/castles/{version}',
      ];
      const expectedBearerTokenArray: Array<string> = [
        'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-b',
        'sillyFakeBearerToken',
        '-s',
        'https://sandbox-westeros.dragonstone/duties/castles/{version}',
      ];
      const expectedServerArray: Array<string> = [
        'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
        '-n',
        '-s',
        'https://sandbox-westeros.stormsend/duties/castles/{version}',
      ];
      await PositiveAll.run(['./test/configs/test-config.json']);
      expect(Positive.run).toHaveBeenCalledTimes(3);
      expect(Positive.run).toHaveBeenCalledWith(expectedApiKeyArray);
      expect(Positive.run).toHaveBeenCalledWith(expectedBearerTokenArray);
      expect(Positive.run).toHaveBeenCalledWith(expectedServerArray);
    });
  });

  describe('loadSpecFromFile', () => {
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
