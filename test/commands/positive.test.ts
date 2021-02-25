import Positive from '../../src/commands/positive';
import { TypeMismatch } from '../../src/validation-failures';
import ValidationFailure from '../../src/validation-failures/validation-failure';

const mockGetParameters = jest.fn();
const mockGetOperationIds = jest.fn();
const mockExecute = jest.fn();
const mockValidateResponse = jest.fn();
const mockValidateParameters = jest.fn();

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
      validateParameters: mockValidateParameters,
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
    mockValidateParameters.mockReset();

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
      () => new Promise((resolve) => resolve([])),
    );
    mockValidateParameters.mockImplementation(
      () => new Promise((resolve) => resolve([])),
    );
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

    it('validates the example parameters', async () => {
      mockGetParameters.mockImplementation(
        () =>
          new Promise((resolve) =>
            resolve({
              walkIntoMordor: {
                default: {
                  guide: 'gollum',
                },
              },
              getHobbit: {
                default: {
                  name: 'Frodo',
                },
              },
              getTomBombadil: {
                default: {
                  times: 2,
                },
              },
            }),
          ),
      );

      await Positive.run(['http://urldoesnotmatter.com']);

      expect(mockValidateParameters).toHaveBeenCalledTimes(3);
      expect(mockValidateParameters).toHaveBeenCalledWith('walkIntoMordor', {
        guide: 'gollum',
      });
      expect(mockValidateParameters).toHaveBeenCalledWith('getHobbit', {
        name: 'Frodo',
      });
      expect(mockValidateParameters).toHaveBeenCalledWith('getTomBombadil', {
        times: 2,
      });
    });

    describe('parameter validation fails', () => {
      it('outputs a failure for that operation', async () => {
        mockValidateParameters.mockImplementation(
          (operationId) =>
            new Promise((resolve) => {
              if (operationId === 'walkIntoMordor')
                resolve([
                  new TypeMismatch(
                    ['parameters', 'guide', 'example'],
                    'string',
                    'number',
                  ),
                ]);

              resolve([]);
            }),
        );

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed\n',
          '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> guide -> example\n',
          'getHobbit: Succeeded\n',
          'getTomBombadil: Succeeded\n',
        ]);
      });
    });

    describe('operation has parameter groups', () => {
      beforeEach(() => {
        mockGetParameters.mockImplementation(
          () =>
            new Promise((resolve) =>
              resolve({
                walkIntoMordor: [
                  {
                    door: {
                      door: 'front',
                    },
                  },
                  {
                    guided: {
                      guide: 'gollum',
                    },
                  },
                ],
                getHobbit: {
                  default: { name: 'Frodo' },
                },
                getTomBombadil: {
                  default: { times: 2 },
                },
              }),
            ),
        );
      });

      describe('one of the parameter groups fails parameter validation', () => {
        it('does not execute a request for that parameter group', async () => {
          mockValidateParameters.mockImplementationOnce(
            () =>
              new Promise((resolve) => {
                resolve([new ValidationFailure('Failure', [])]);
              }),
          );

          await expect(async () => {
            await Positive.run(['http://urldoesnotmatter.com']);
          }).rejects.toThrow('1 operation failed');

          expect(mockExecute).not.toHaveBeenCalledWith('walkIntoMordor', {
            door: 'front',
          });

          expect(mockExecute).toHaveBeenCalledWith('walkIntoMordor', {
            guide: 'gollum',
          });

          expect(mockExecute).toHaveBeenCalledWith('getHobbit', {
            name: 'Frodo',
          });

          expect(mockExecute).toHaveBeenCalledWith('getTomBombadil', {
            times: 2,
          });
        });
      });

      it('validates the examples for each parameter group', async () => {
        await Positive.run(['http://urldoesnotmatter.com']);

        expect(mockValidateParameters).toHaveBeenCalledTimes(4);
        expect(mockValidateParameters).toHaveBeenCalledWith('walkIntoMordor', {
          door: 'front',
        });
        expect(mockValidateParameters).toHaveBeenCalledWith('walkIntoMordor', {
          guide: 'gollum',
        });
        expect(mockValidateParameters).toHaveBeenCalledWith('getHobbit', {
          name: 'Frodo',
        });
        expect(mockValidateParameters).toHaveBeenCalledWith('getTomBombadil', {
          times: 2,
        });
      });

      it('generates requests and validates responses for each parameter group', async () => {
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve([])),
        );

        await Positive.run(['http://urldoesnotmatter.com']);

        expect(mockExecute).toHaveBeenCalledTimes(2);
        expect(mockExecute).toHaveBeenCalledWith('walkIntoMordor', {
          door: 'front',
        });
        expect(mockExecute).toHaveBeenCalledWith('walkIntoMordor', {
          guide: 'gollum',
        });

        expect(result).toEqual(
          expect.arrayContaining([
            'walkIntoMordor - guided: Succeeded\n',
            'walkIntoMordor - door: Succeeded\n',
          ]),
        );
      });
    });

    describe('one of the operations fails validation', () => {
      it('throws an error', async () => {
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
          () =>
            new Promise((resolve) => {
              resolve([new ValidationFailure('woah there was an error', [])]);
            }),
        );
        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed\n',
          '  - woah there was an error\n',
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
        mockValidateResponse.mockImplementation(
          () => new Promise((resolve) => resolve([])),
        );
        mockValidateResponse.mockImplementation(
          () =>
            new Promise((resolve) => {
              resolve([new ValidationFailure('woah there was an error', [])]);
            }),
        );
        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('2 operations failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed\n',
          '  - woah there was an error\n',
          'getHobbit: Failed\n',
          '  - woah there was an error\n',
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
                status: 404,
                ok: false,
              }),
            ),
        );

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual(['walkIntoMordor: Failed\n']);
      });
    });

    describe('one of the operations returns more than one validation failure', () => {
      it('outputs all the failures', async () => {
        mockGetOperationIds.mockImplementation(
          () => new Promise((resolve) => resolve(['walkIntoMordor'])),
        );
        mockValidateResponse.mockImplementation(
          () =>
            new Promise((resolve) => {
              resolve([
                new ValidationFailure('Failure 1', []),
                new ValidationFailure('Failure 2', []),
              ]);
            }),
        );

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual([
          'walkIntoMordor: Failed\n',
          '  - Failure 1\n',
          '  - Failure 2\n',
        ]);
      });
    });

    it('validates a response for each endpoint in the spec', async () => {
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
        () => new Promise((resolve) => resolve([])),
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
