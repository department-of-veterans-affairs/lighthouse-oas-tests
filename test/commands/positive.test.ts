const mockPrompt = jest.fn();
import { ResponseObject } from 'swagger-client';
import Positive from '../../src/commands/positive';
import OASOperation from '../../src/utilities/oas-operation';

const mockGetOperations = jest.fn();
const mockGetSecuritySchemes = jest.fn();
const mockSetAPISecurity = jest.fn();
const mockExecute = jest.fn();

jest.mock('../../src/utilities/oas-schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getOperations: mockGetOperations,
      getSecuritySchemes: mockGetSecuritySchemes,
      setAPISecurity: mockSetAPISecurity,
      execute: mockExecute,
    };
  };
});

jest.mock('cli-ux', () => {
  return {
    cli: {
      prompt: mockPrompt,
    },
  };
});

describe('Positive', () => {
  let result;
  const defaultResponses: { [responseCode: string]: ResponseObject } = {
    '200': {
      description: '',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  };

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));
    mockPrompt.mockReset();
    mockGetOperations.mockReset();
    mockGetOperations.mockResolvedValue([
      'walkIntoMordor',
      'getHobbit',
      'getTomBombadil',
    ]);
    mockGetSecuritySchemes.mockReset();
    mockGetSecuritySchemes.mockResolvedValue([
      {
        securityType: 'apiKey',
        description: 'one does simply walk into VA APIs',
        name: 'boromir-security',
        in: 'header',
      },
    ]);
    mockSetAPISecurity.mockReset();
    mockExecute.mockReset();
    mockExecute.mockResolvedValue({
      url: 'https://www.lotr.com/walkIntoMorder',
      status: 200,
      ok: true,
      body: {},
      headers: {
        'content-type': 'application/json',
      },
    });
  });

  describe('API key is not set', () => {
    beforeEach(() => {
      process.env.API_KEY = '';
      mockGetOperations.mockReset();
      mockGetOperations.mockResolvedValue([
        {
          operationId: 'walkIntoMordor',
          exampleGroups: [],
        },
      ]);
    });
    it('requests an apiKey when apiKey scheme exists', async () => {
      await Positive.run(['http://isengard.com']);
      expect(mockPrompt).toHaveBeenCalled();
    });
    it("does not request an apiKey when apiKey scheme doesn't exist", async () => {
      mockGetSecuritySchemes.mockReset();
      mockGetSecuritySchemes.mockResolvedValue([
        {
          securityType: 'http',
          description: 'one does simply walk into VA APIs',
          name: 'boromir-security',
        },
      ]);
      await Positive.run(['http://isengard.com']);
      expect(mockPrompt).not.toHaveBeenCalled();
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

    it('outputs a failure for an operation if parameter validation fails', async () => {
      mockGetOperations.mockResolvedValue([
        new OASOperation({
          operationId: 'walkIntoMordor',
          parameters: [
            {
              name: 'guide',
              in: 'query',
              schema: {
                type: 'string',
              },
              required: true,
              example: 42,
            },
          ],
          responses: defaultResponses,
        }),
      ]);

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(result).toEqual([
        'walkIntoMordor: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> guide -> example\n',
      ]);
    });

    describe('operation has parameter groups', () => {
      it('does not execute a request for a parameter group that fails parameter validation', async () => {
        const operation1 = new OASOperation({
          operationId: 'walkIntoMordor',
          responses: defaultResponses,
          parameters: [
            {
              name: 'door',
              in: 'query',
              schema: {
                type: 'string',
              },
              examples: {
                door: {
                  value: 2,
                },
              },
            },
            {
              name: 'guide',
              in: 'query',
              schema: {
                type: 'string',
              },
              examples: {
                guided: {
                  value: 'gollum',
                },
              },
            },
          ],
        });
        const operation2 = new OASOperation({
          operationId: 'getHobbit',
          responses: defaultResponses,
          parameters: [
            {
              name: 'name',
              in: 'query',
              schema: {
                type: 'string',
              },
              example: 'Frodo',
            },
          ],
        });
        const operation3 = new OASOperation({
          operationId: 'getTomBombadil',
          responses: defaultResponses,
          parameters: [
            {
              name: 'times',
              in: 'query',
              example: 2,
              schema: {
                type: 'number',
              },
            },
          ],
        });
        mockGetOperations.mockResolvedValue([
          operation1,
          operation2,
          operation3,
        ]);

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(mockExecute).not.toHaveBeenCalledWith(
          operation1,
          operation1.exampleGroups[0],
        );

        expect(mockExecute).toHaveBeenCalledWith(
          operation1,
          operation1.exampleGroups[1],
        );

        expect(mockExecute).toHaveBeenCalledWith(
          operation2,
          operation2.exampleGroups[0],
        );

        expect(mockExecute).toHaveBeenCalledWith(
          operation3,
          operation3.exampleGroups[0],
        );
      });

      it('validates the responses for each parameter group', async () => {
        const operation1 = new OASOperation({
          operationId: 'walkIntoMordor',
          responses: defaultResponses,
          parameters: [
            {
              name: 'door',
              in: 'query',
              schema: {
                type: 'string',
              },
              examples: {
                door: {
                  value: 'front',
                },
              },
            },
            {
              name: 'guide',
              in: 'query',
              schema: {
                type: 'string',
              },
              examples: {
                guided: {
                  value: 'gollum',
                },
              },
            },
          ],
        });
        const operation2 = new OASOperation({
          operationId: 'getHobbit',
          responses: defaultResponses,
          parameters: [
            {
              name: 'name',
              in: 'query',
              schema: {
                type: 'string',
              },
              example: 'Frodo',
            },
          ],
        });
        const operation3 = new OASOperation({
          operationId: 'getTomBombadil',
          responses: defaultResponses,
          parameters: [
            {
              name: 'times',
              in: 'query',
              example: 2,
              schema: {
                type: 'number',
              },
            },
          ],
        });
        mockGetOperations.mockResolvedValue([
          operation1,
          operation2,
          operation3,
        ]);

        mockExecute.mockResolvedValueOnce({
          url: 'https://www.lotr.com/walkIntoMorder',
          status: 200,
          ok: true,
          body: {
            data: [42],
          },
          headers: {
            'content-type': 'application/json',
          },
        });

        await expect(async () => {
          await Positive.run(['http://urldoesnotmatter.com']);
        }).rejects.toThrow('1 operation failed');

        expect(result).toEqual([
          'walkIntoMordor - door: Failed\n',
          '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data\n',
          'walkIntoMordor - guided: Succeeded\n',
          'getHobbit: Succeeded\n',
          'getTomBombadil: Succeeded\n',
        ]);
      });
    });

    it('outputs the failures and throws an error when more than one of the operations fails validation', async () => {
      const operation2 = new OASOperation({
        operationId: 'getHobbit',
        responses: defaultResponses,
        parameters: [
          {
            name: 'name',
            in: 'query',
            schema: {
              type: 'string',
            },
            example: 'Frodo',
          },
        ],
      });
      const operation3 = new OASOperation({
        operationId: 'getTomBombadil',
        responses: defaultResponses,
        parameters: [
          {
            name: 'times',
            in: 'query',
            example: 2,
            schema: {
              type: 'number',
            },
          },
        ],
      });
      mockGetOperations.mockResolvedValue([operation2, operation3]);

      mockExecute.mockResolvedValue({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: [42],
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('2 operations failed');

      expect(result).toEqual([
        'getHobbit: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data\n',
        'getTomBombadil: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data\n',
      ]);
    });

    it('outputs the failure and throws an error when one of the responses returns a non-ok status', async () => {
      const operation2 = new OASOperation({
        operationId: 'getHobbit',
        responses: defaultResponses,
        parameters: [
          {
            name: 'name',
            in: 'query',
            schema: {
              type: 'string',
            },
            example: 'Frodo',
          },
        ],
      });
      const operation3 = new OASOperation({
        operationId: 'getTomBombadil',
        responses: defaultResponses,
        parameters: [
          {
            name: 'times',
            in: 'query',
            example: 2,
            schema: {
              type: 'number',
            },
          },
        ],
      });
      mockGetOperations.mockResolvedValue([operation2, operation3]);

      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 404,
        ok: false,
        body: {},
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(result).toEqual([
        'getHobbit: Failed\n',
        '  - Response status code was a non 2XX value\n',
        'getTomBombadil: Succeeded\n',
      ]);
    });

    it('outputs all the failures when one of the operations returns more than one validation failure', async () => {
      const operation = new OASOperation({
        operationId: 'getHobbit',
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        one: {
                          type: 'number',
                        },
                        two: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        parameters: [
          {
            name: 'name',
            in: 'query',
            schema: {
              type: 'string',
            },
            example: 'Frodo',
          },
        ],
      });
      mockGetOperations.mockResolvedValue([operation]);

      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: {
            one: 'number',
            two: 42,
          },
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(result).toEqual([
        'getHobbit: Failed\n',
        '  - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> data -> one\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data -> two\n',
      ]);
    });
  });
});
