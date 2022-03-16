import { ResponseObject } from 'swagger-client';
const mockPrompt = jest.fn();
import Positive from '../../src/commands/positive';
import OASOperation from '../../src/utilities/oas-operation';
import OASServer from '../../src/utilities/oas-server/oas-server';

const mockGetOperations = jest.fn();
const mockGetServers = jest.fn();
const mockGetSecuritySchemes = jest.fn();
const mockExecute = jest.fn();

jest.mock('../../src/utilities/oas-schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getServers: mockGetServers,
      getOperations: mockGetOperations,
      getSecuritySchemes: mockGetSecuritySchemes,
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
      new OASOperation(
        {
          operationId: 'walkIntoMordor',
          responses: defaultResponses,
          parameters: [
            {
              name: 'guide',
              in: 'query',
              schema: {
                type: 'string',
              },
              required: true,
              example: 'golem',
            },
          ],
        },
        [{ 'boromir-security': [] }],
      ),
      new OASOperation(
        {
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
        },
        [{ 'boromir-security': [] }],
      ),
      new OASOperation(
        {
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
        },
        [{ 'faramir-security': [] }],
      ),
    ]);

    mockGetServers.mockReset();
    mockGetServers.mockResolvedValue([
      new OASServer('https://lotr.com/services/the-fellowship/v0'),
    ]);

    mockGetSecuritySchemes.mockReset();
    mockGetSecuritySchemes.mockResolvedValue([
      {
        key: 'boromir-security',
        type: 'apiKey',
        description: 'one does simply walk into VA APIs',
        name: 'boromir-security',
        in: 'header',
      },
    ]);

    mockExecute.mockReset();
    mockExecute.mockResolvedValue({
      url: 'https://www.lotr.com/walkIntoMorder',
      status: 200,
      ok: true,
      body: {
        data: ['test'],
      },
      headers: {
        'content-type': 'application/json',
      },
    });
  });

  describe('promptForServerValue', () => {
    const operation = new OASOperation({
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

    beforeEach(() => {
      mockGetOperations.mockResolvedValue([operation]);
      mockGetSecuritySchemes.mockResolvedValue([]);
      mockGetServers.mockResolvedValue([
        new OASServer('https://sandbox-lotr.com/services/the-fellowship/v0'),
        new OASServer('https://lotr.com/services/the-fellowship/v0'),
      ]);
    });

    describe('the server parameter is provided', () => {
      it('does not prompt for a server', async () => {
        await Positive.run([
          'http://path-doesnt-matter.com',
          '-s',
          'https://lotr.com/services/the-fellowship/v0',
        ]);
        expect(mockPrompt).not.toHaveBeenCalled();
      });

      it('calls execute with the server parameter value', async () => {
        await Positive.run([
          'http://path-doesnt-matter.com',
          '-s',
          'https://lotr.com/services/the-fellowship/v0',
        ]);
        expect(mockExecute).toHaveBeenCalledWith(
          operation,
          operation.exampleGroups[0],
          {},
          'https://lotr.com/services/the-fellowship/v0',
        );
      });

      it('throws an error if the parameter value is not valid', async () => {
        await expect(
          Positive.run([
            'http://path-doesnt-matter.com',
            '-s',
            'https://server-does-not-match.com',
          ]),
        ).rejects.toThrow(
          'Server value must match one of the server URLs in the OAS',
        );
      });
    });

    describe('the server parameter is not provided', () => {
      describe('OAS servers array has 1 item', () => {
        beforeEach(() => {
          mockGetServers.mockResolvedValue([
            new OASServer('https://lotr.com/services/the-fellowship/v0'),
          ]);
        });

        it('does not prompt for a server', async () => {
          await Positive.run(['http://path-doesnt-matter.com']);
          expect(mockPrompt).not.toHaveBeenCalled();
        });

        it('calls execute with an undefined server', async () => {
          await Positive.run(['http://path-doesnt-matter.com']);
          expect(mockExecute).toHaveBeenCalledWith(
            operation,
            operation.exampleGroups[0],
            {},
            undefined,
          );
        });
      });
      describe('OAS servers array has multiple items', () => {
        it('prompts for a server', async () => {
          await Positive.run(['http://path-doesnt-matter.com']);
          expect(mockPrompt).toHaveBeenCalledTimes(1);
          expect(mockPrompt).toHaveBeenCalledWith(
            'Please provide the server URL to use',
          );
        });

        it('calls execute with the server value from the prompt', async () => {
          mockPrompt.mockResolvedValue(
            'https://lotr.com/services/the-fellowship/v0',
          );

          await Positive.run(['http://path-doesnt-matter.com']);
          expect(mockExecute).toHaveBeenCalledWith(
            operation,
            operation.exampleGroups[0],
            {},
            'https://lotr.com/services/the-fellowship/v0',
          );
        });

        it('throws an error if the prompted server value is not valid', async () => {
          mockPrompt.mockResolvedValue('https://server-does-not-match.com');

          await expect(
            Positive.run(['http://path-doesnt-matter.com']),
          ).rejects.toThrow(
            'Server value must match one of the server URLs in the OAS',
          );
        });
      });
    });
  });

  describe('OAS operation has parameter groups', () => {
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
      mockGetOperations.mockResolvedValue([operation1, operation2, operation3]);

      const security = {};

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(mockExecute).not.toHaveBeenCalledWith(
        operation1,
        operation1.exampleGroups[0],
        security,
        undefined,
      );

      expect(mockExecute).toHaveBeenCalledWith(
        operation1,
        operation1.exampleGroups[1],
        security,
        undefined,
      );

      expect(mockExecute).toHaveBeenCalledWith(
        operation2,
        operation2.exampleGroups[0],
        security,
        undefined,
      );

      expect(mockExecute).toHaveBeenCalledWith(
        operation3,
        operation3.exampleGroups[0],
        security,
        undefined,
      );
    });
    it('Validate response(s) for each parameter group', async () => {
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
      mockGetOperations.mockResolvedValue([operation1, operation2, operation3]);

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
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data. Found 1 time\n',
        'walkIntoMordor - guided: Succeeded\n',
        'walkIntoMordor - default: Succeeded\n',
        'getHobbit - default: Succeeded\n',
        'getTomBombadil - default: Succeeded\n',
      ]);
    });
  });

  describe('loadSpecFromFile', () => {
    beforeEach(() => {
      process.env.API_KEY = 'testApiKey';
    });

    it('JSON file does not exist', async () => {
      await expect(async () => {
        await Positive.run(['fileDoesNotExist.json']);
      }).rejects.toThrow('unable to load json file');
    });

    it('JSON file has invalid JSON', async () => {
      await expect(async () => {
        await Positive.run(['./test/fixtures/invalid.json']);
      }).rejects.toThrow('unable to load json file');
    });

    it('Successful load of YAML file type specification', async () => {
      const operation = new OASOperation({
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
      mockGetOperations.mockResolvedValue([operation]);

      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: ['frodo'],
        },
        headers: {
          'content-type': 'application/json',
        },
      });
      await Positive.run(['./test/fixtures/forms_oas.yaml']);

      expect(result).toEqual(['getHobbit - default: Succeeded\n']);
    });

    it('YAML file does not exist', async () => {
      await expect(async () => {
        await Positive.run(['fileDoesNotExist.yaml']);
      }).rejects.toThrow('unable to load yaml file');
    });

    it('Unsupported file type throws an error', async () => {
      await expect(async () => {
        await Positive.run(['./test/fixtures/file.xml']);
      }).rejects.toThrow(
        'File is of a type not supported by OAS (.json, .yml, .yaml)',
      );
    });
  });

  describe('promptForSecurityValues', () => {
    beforeEach(() => {
      mockPrompt.mockReset();
      mockGetSecuritySchemes.mockReset();
    });

    it('Request apiKey when apiKey scheme exists', async () => {
      mockGetSecuritySchemes.mockResolvedValue([
        {
          key: 'boromir-security',
          type: 'apiKey',
          description: 'one does simply walk into VA APIs',
          name: 'boromir-security',
          in: 'header',
        },
      ]);

      await Positive.run([
        './test/fixtures/securities/spec_level_security_oas.json',
      ]);

      expect(mockPrompt).toHaveBeenCalled();
      expect(mockPrompt).toHaveBeenCalledWith('Please provide your API Key', {
        type: 'mask',
      });
    });

    describe('API key is not set', () => {
      beforeEach(() => {
        process.env.API_KEY = '';
      });

      it('Skip when apiKey scheme does not exist', async () => {
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

    it('Request bearer token when http bearer scheme exists', async () => {
      mockGetSecuritySchemes.mockResolvedValue([
        {
          key: 'boromir-security',
          type: 'http',
          description: 'one does simply walk into VA APIs',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      ]);

      await Positive.run(['./test/fixtures/securities/bearer_token_oas.json']);

      expect(mockPrompt).toHaveBeenCalled();
      expect(mockPrompt).toHaveBeenCalledWith('Please provide your token', {
        type: 'mask',
      });
    });

    it('Request oauth token when oauth type exists', async () => {
      mockGetSecuritySchemes.mockResolvedValue([
        {
          key: 'boromir-security',
          type: 'oauth2',
          description: 'one does simply walk into VA APIs',
        },
      ]);

      await Positive.run(['https://url-does-not-matter.com']);

      expect(mockPrompt).toHaveBeenCalled();
      expect(mockPrompt).toHaveBeenCalledWith('Please provide your token', {
        type: 'mask',
      });
    });

    it('Prompts once if OAS contains both http bearer and oauth2 security schemes', async () => {
      mockGetSecuritySchemes.mockResolvedValue([
        {
          key: 'boromir-security',
          type: 'http',
          description: 'one does simply walk into VA APIs',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        {
          key: 'faramir-security',
          type: 'oauth2',
          description: 'one does simply walk into VA APIs',
        },
      ]);
      mockPrompt.mockResolvedValue('token');

      await Positive.run(['https://url-does-not-matter.com']);

      expect(mockPrompt).toHaveBeenCalledTimes(1);
      expect(mockPrompt).toHaveBeenCalledWith('Please provide your token', {
        type: 'mask',
      });
    });

    it('Request authorization for each security type in specification', async () => {
      mockGetSecuritySchemes.mockResolvedValue([
        {
          key: 'faramir-security',
          type: 'apiKey',
          description:
            'A chance for Faramir, Captain of Gondor, to show his quality!',
          name: 'faramir-security',
          in: 'header',
        },
        {
          key: 'boromir-security',
          type: 'http',
          description: 'one does simply walk into VA APIs',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      ]);

      await Positive.run(['./test/fixtures/securities/mixed_levels_oas.json']);

      expect(mockPrompt).toHaveBeenCalled();
      expect(mockPrompt).toHaveBeenCalledTimes(2);
    });

    it('No security schemes defined in component object', async () => {
      mockGetSecuritySchemes.mockResolvedValue([]);

      await expect(
        Positive.run([
          './test/fixtures/securities/no_security_schemes_oas.json',
        ]),
      ).rejects
        .toThrow(`The following security requirements exist but no corresponding security scheme exists on a components object: boromir-security,faramir-security.
  See more at: https://swagger.io/specification/#security-requirement-object`);

      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe('output', () => {
    const operation = new OASOperation({
      operationId: 'getHobbits',
      responses: {
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

    beforeEach(() => {
      mockGetOperations.mockResolvedValue([operation]);
    });

    it('On parameter validation failure, output operation failure', async () => {
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
        'walkIntoMordor - default: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> guide -> example. Found 1 time\n',
      ]);
    });

    it('On multiple operation failures, output error(s) and operation failure(s)', async () => {
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
        'getHobbit - default: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data. Found 1 time\n',
        'getTomBombadil - default: Failed\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data. Found 1 time\n',
      ]);
    });

    it('On single non-ok response status, output error and failure', async () => {
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
        'getHobbit - default: Failed\n',
        '  - Response status code was a non 2XX value. Found 1 time\n',
        'getTomBombadil - default: Succeeded\n',
      ]);
    });

    it('On multiple validation failures per operation, output all errors and failures', async () => {
      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: [
            {
              one: 'number',
              two: 42,
            },
          ],
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(result).toEqual([
        'getHobbits - default: Failed\n',
        '  - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> data -> one. Found 1 time\n',
        '  - Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> data -> two. Found 1 time\n',
      ]);
    });

    it('Output current warnings', async () => {
      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: [],
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      await Positive.run(['http://urldoesnotmatter.com']);

      expect(result).toEqual([
        'getHobbits - default: Succeeded\n',
        '  - Warning: This array was found to be empty and therefore could not be validated. Path: body -> data. Found 1 time\n',
      ]);
    });

    it('Log redundant failures and warnings with count', async () => {
      mockExecute.mockResolvedValueOnce({
        url: 'https://www.lotr.com/walkIntoMorder',
        status: 200,
        ok: true,
        body: {
          data: [
            {
              one: 'not a number',
            },
            {
              one: 1,
            },
            {
              one: 'also not a number',
            },
          ],
        },
        headers: {
          'content-type': 'application/json',
        },
      });

      await expect(async () => {
        await Positive.run(['http://urldoesnotmatter.com']);
      }).rejects.toThrow('1 operation failed');

      expect(result).toEqual([
        'getHobbits - default: Failed\n',
        '  - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> data -> one. Found 2 times\n',
        '  - Warning: This object is missing non-required properties that were unable to be validated, including two. Path: body -> data. Found 3 times\n',
      ]);
    });
  });
});
