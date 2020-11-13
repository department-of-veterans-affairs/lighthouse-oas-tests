import Positive from '../../src/commands/positive';

describe('Positive', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));
  });

  describe('API key is not set', () => {
    beforeEach(() => {
      process.env.API_KEY = '';
    });
    it('throws an error', async () => {
      await expect(async () => {
        await Positive.run(['asdf']);
      }).rejects.toThrow(
        'apiKey flag should be provided or the API_KEY environment variable should be set',
      );
    });
  });

  describe('The file flag is passed', () => {
    beforeEach(() => {
      process.env.API_KEY = 'testApiKey';
    });
    const baseCommand = ['-f'];

    describe('Json is not loaded from the file', () => {
      describe('Provided file does not exist', () => {
        it('throws an error', async () => {
          await expect(async () => {
            await Positive.run([...baseCommand, 'fileDoesNotExist.json']);
          }).rejects.toThrow('unable to load json file');
        });
      });

      describe('Non-json file', () => {
        it('throws an error', async () => {
          await expect(async () => {
            await Positive.run([...baseCommand, './fixtures/file.xml']);
          }).rejects.toThrow('unable to load json file');
        });
      });

      describe('Invalid json', () => {
        it('throws an error', async () => {
          await expect(async () => {
            await Positive.run([...baseCommand, './fixtures/invalid.json']);
          }).rejects.toThrow('unable to load json file');
        });
      });
    });
  });
});
