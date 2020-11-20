import Positive from '../../src/commands/positive';

const mockGetParameters = jest.fn();
const mockGetOperationIds = jest.fn();
const mockExecute = jest.fn();

jest.mock('../../src/utilities/oas-schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getParameters: mockGetParameters,
      getOperationIds: mockGetOperationIds,
      execute: mockExecute,
    };
  };
});

describe('Positive', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));

    mockGetParameters.mockReset();
    mockGetOperationIds.mockReset();
    mockExecute.mockReset();
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

    it('generates requests for each endpoint in the spec', async () => {
      mockGetParameters.mockImplementation(
        () => new Promise((resolve) => resolve({})),
      );
      mockGetOperationIds.mockImplementation(
        () =>
          new Promise((resolve) =>
            resolve(['walkIntoMordor', 'getHobbit', 'getTomBombadil']),
          ),
      );
      mockExecute
        .mockReturnValueOnce(
          new Promise((resolve) =>
            resolve({
              url: 'https://www.lotr.com/walkIntoMorder',
              status: 400,
              ok: false,
            }),
          ),
        )
        .mockReturnValueOnce(
          new Promise((resolve) =>
            resolve({
              url: 'https://www.lotr.com/getHobbit',
              status: 200,
              ok: true,
            }),
          ),
        )
        .mockReturnValueOnce(
          new Promise((resolve) =>
            resolve({
              url: 'https://www.lotr.com/getTomBombadil',
              status: 404,
              ok: false,
            }),
          ),
        );

      await Positive.run(['http://urldoesnotmatter.com']);

      expect(result).toEqual([
        'https://www.lotr.com/walkIntoMorder: 400 Not OK\n',
        'https://www.lotr.com/getHobbit: 200 OK\n',
        'https://www.lotr.com/getTomBombadil: 404 Not OK\n',
      ]);
    });
  });
});
