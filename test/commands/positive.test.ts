import Positive from '../../src/commands/positive';

const mockGetParameters = jest.fn();
const mockGetOperationIds = jest.fn();
const mockExecute = jest.fn();
const mockValidateResponse = jest.fn();

jest.mock('../../src/utilities/oas-schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getParameters: mockGetParameters,
      getOperationIds: mockGetOperationIds,
      execute: mockExecute,
    };
  };
});
jest.mock('../../src/utilities/oas-validator', () => {
  return function (): Record<string, jest.Mock> {
    return {
      validateResponse: mockValidateResponse,
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
    mockValidateResponse.mockReset();
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

    describe('operation has parameter groups', () => {
      it('generates requests and validates responses for each parameter group', async () => {
        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                walkIntoMordor: [
                  {
                    where: {
                      door: 'front',
                    },
                  },
                  {
                    who: {
                      guide: 'gollum',
                    },
                  },
                ],
              }),
            ),
        );
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );
        mockExecute.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                url: 'https://www.lotr.com/walkIntoMorder',
                status: 200,
                ok: true,
              }),
            ),
        );
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve()),
        );

        await Positive.run(['http://urldoesnotmatter.com']);

        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockExecute).toHaveBeenCalledWith('walkIntoMordor', {
          door: 'front',
        });
        expect(mockExecute).toHaveBeenCalledWith('walkIntoMordor', {
          guide: 'gollum',
        });

        expect(result).toEqual([
          'walkIntoMordor - where: Succeeded\n',
          'walkIntoMordor - who: Succeeded\n',
        ]);
      });
    });

    describe('unexpected parameters format', () => {
      it('throws an error', async () => {
        const parameterExamples = {
          where: {
            door: 'front',
          },
          who: {
            guide: 'gollum',
          },
        };

        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({ walkIntoMordor: parameterExamples }),
            ),
        );
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow(
          `Unexpected parameters format: ${JSON.stringify(parameterExamples)}`,
        );
      });
    });

    describe('one of the operations fails validation', () => {
      it('throws an error', async () => {
        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({ walkIntoMordor: { default: {} } }),
            ),
        );
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );
        mockExecute.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                url: 'https://www.lotr.com/walkIntoMorder',
                status: 400,
                ok: false,
              }),
            ),
        );
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve()),
        );
        mockValidateResponse.mockImplementation(
          () =>
            new Promise(() => {
              throw new TypeError('woah there was an error');
            }),
        );
        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed - woah there was an error\n',
        ]);
      });
    });

    describe('more than one of the operations fails validation', () => {
      it('throws an error', async () => {
        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                walkIntoMordor: { default: {} },
                getHobbit: { default: {} },
              }),
            ),
        );
        mockGetOperationIds.mockImplementation(
          () =>
            new Promise((resolve) => resolve(['walkIntoMordor', 'getHobbit'])),
        );
        mockExecute.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                url: 'https://www.lotr.com/walkIntoMordor',
                status: 400,
                ok: false,
              }),
            ),
        );
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve()),
        );
        mockValidateResponse.mockImplementation(
          () =>
            new Promise(() => {
              throw new TypeError('woah there was an error');
            }),
        );
        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('2 operations failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed - woah there was an error\n',
          'getHobbit: Failed - woah there was an error\n',
        ]);
      });
    });

    describe('one of the responses returns a non-ok status', () => {
      it('throws an error', async () => {
        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({ walkIntoMordor: { default: {} } }),
            ),
        );
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );
        mockExecute.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                url: 'https://www.lotr.com/walkIntoMorder',
                status: 400,
                ok: false,
              }),
            ),
        );
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve()),
        );
        mockValidateResponse.mockImplementation(
          () =>
            new Promise((resolve) => {
              resolve();
            }),
        );
        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual(['walkIntoMordor: Failed\n']);
      });
    });

    it('validates a response for each endpoint in the spec', async () => {
      mockGetParameters.mockImplementation(
        () =>
          new Promise((resolve) =>
            resolve({
              walkIntoMordor: { default: {} },
              getHobbit: { default: {} },
              getTomBombadil: { default: {} },
            }),
          ),
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
      mockValidateResponse.mockImplementation(
        () => new Promise((resolve) => resolve()),
      );

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('2 operations failed');

      expect(result).toEqual([
        'walkIntoMordor: Failed\n',
        'getHobbit: Succeeded\n',
        'getTomBombadil: Failed\n',
      ]);
    });
  });
});
