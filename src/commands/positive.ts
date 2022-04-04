import Command, { flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import loadJsonFile from 'load-json-file';
import { uniq } from 'lodash';
import parseUrl from 'parse-url';
import { extname, resolve } from 'path';
import { Json, Security } from 'swagger-client';
import { BEARER_SECURITY_SCHEME } from '../utilities/constants';
import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import OASSchema from '../utilities/oas-schema';
import { OASSecurityType } from '../utilities/oas-security';
import OASServer from '../utilities/oas-server/oas-server';
import {
  ParameterSchemaValidator,
  ExampleGroupValidator,
  ResponseValidator,
} from '../utilities/validators';
import {
  InvalidResponse,
  ValidationFailure,
} from '../validation-messages/failures';
import { ValidationWarning } from '../validation-messages/warnings';
import { OperationExample } from './types';

export default class Positive extends Command {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({
      char: 'a',
      description: 'API key to use',
    }),
    bearerToken: flags.string({
      char: 'b',
      description: 'Bearer token to use',
      env: 'LOAST_BEARER_TOKEN',
    }),
    noPrompt: flags.boolean({
      char: 'n',
      default: false,
      description: 'Prevent user prompts',
    }),
    server: flags.string({
      char: 's',
      description: 'Server URL to use',
    }),
  };

  static args = [
    {
      name: 'path',
      required: true,
      description: 'Url or local file path containing the OpenAPI spec',
    },
  ];

  private schema!: OASSchema;

  private operationExamples: OperationExample[] = [];

  private failingOperations: OASOperation[] = [];

  private securities: string[] = [];

  private securityValues: Security = {};

  async run(): Promise<void> {
    const { args, flags } = this.parse(Positive);
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};
    const path = parseUrl(args.path);

    if (path.protocol === 'file') {
      oasSchemaOptions.spec = await this.loadSpecFromFile(args.path);
    } else {
      oasSchemaOptions.url = args.path;
    }

    this.schema = new OASSchema(oasSchemaOptions);

    const server: string | undefined = await this.promptForServerValue(
      flags.server,
      flags.noPrompt,
    );

    this.securities = await this.getSecurities();

    if (this.securities.length > 0) {
      await this.promptForSecurityValues(flags);
    }

    await this.buildOperationExamples();

    await Promise.all(
      this.operationExamples.map(async (operationExample) => {
        let failures: Map<string, ValidationFailure> = new Map();
        let warnings: Map<string, ValidationWarning> = new Map();

        const { operation, exampleGroup } = operationExample;
        const parameterSchemaValidator = new ParameterSchemaValidator(
          operation,
        );
        parameterSchemaValidator.validate();
        failures = new Map([...failures, ...parameterSchemaValidator.failures]);
        warnings = new Map([...warnings, ...parameterSchemaValidator.warnings]);

        const parameterValidator = new ExampleGroupValidator(exampleGroup);
        parameterValidator.validate();

        failures = new Map([...failures, ...parameterValidator.failures]);
        warnings = new Map([...warnings, ...parameterValidator.warnings]);

        if (failures.size === 0) {
          const response = await this.schema.execute(
            operation,
            exampleGroup,
            this.securityValues,
            server,
          );
          if (response?.ok) {
            const responseValidator = new ResponseValidator(
              operation,
              response,
            );
            responseValidator.validate();

            failures = new Map([...failures, ...responseValidator.failures]);
            warnings = new Map([...warnings, ...responseValidator.warnings]);
          } else if (response) {
            const failure = new InvalidResponse();
            failures.set(failure.hash, failure);
          }
        }

        if (failures.size > 0) {
          this.failingOperations.push(operation);
        }

        this.displayOperationResults(
          operation,
          exampleGroup,
          failures,
          warnings,
        );
      }),
    );

    this.displayResults();
  }

  buildOperationExamples = async (): Promise<void> => {
    const operations = await this.schema.getOperations();

    for (const operation of operations) {
      const exampleGroups = operation.exampleGroups;

      for (const exampleGroup of exampleGroups) {
        const operationExampleId = `${operation.operationId}:${exampleGroup.name}`;
        this.operationExamples.push({
          id: operationExampleId,
          operation,
          exampleGroup,
        });
      }
    }
  };

  loadSpecFromFile = async (path): Promise<Json> => {
    let spec;
    const extension = extname(path);

    if (extension === '.json') {
      try {
        spec = await loadJsonFile(path);
        return spec;
      } catch (error) {
        return this.error('unable to load json file');
      }
    } else if (extension === '.yml' || extension === '.yaml') {
      try {
        const file = readFileSync(resolve(path));
        spec = yaml.load(file);
        return spec;
      } catch (error) {
        this.error('unable to load yaml file');
      }
    } else {
      this.error('File is of a type not supported by OAS (.json, .yml, .yaml)');
    }
  };

  promptForServerValue = async (
    serverParameter: string | undefined,
    noPrompt: boolean | undefined,
  ): Promise<string | undefined> => {
    const servers = await this.schema.getServers();
    const numServers = servers.length;
    let server = serverParameter;

    if (!server && numServers > 1) {
      if (noPrompt) {
        this.log('Server value is null or undefined.');
      } else {
        server = await cli.prompt('Please provide the server URL to use');
      }
    }

    if (server && !this.isServerValid(server, servers)) {
      this.error('Server value must match one of the server URLs in the OAS');
    }

    return server;
  };

  isServerValid = (
    server: string | undefined,
    servers: OASServer[],
  ): boolean => {
    if (server === undefined) {
      return false;
    }
    const urls = servers.map((server) => server.url);
    return urls.includes(server);
  };

  getSecurities = async (): Promise<string[]> => {
    const operations = await this.schema.getOperations();

    return uniq(
      operations.flatMap((operation) => {
        return operation.security.map((security) => security.key);
      }),
    );
  };

  promptForSecurityValues = async (flags: {
    apiKey: string | undefined;
    bearerToken: string | undefined;
    noPrompt: boolean | undefined;
  }): Promise<void> => {
    const securitySchemes = await this.schema.getSecuritySchemes();
    if (securitySchemes.length === 0) {
      if (this.securities.length > 0) {
        this.error(
          `The following security requirements exist but no corresponding security scheme exists on a components object: ${this.securities}.
  See more at: https://swagger.io/specification/#security-requirement-object`,
        );
      }
      return;
    }

    const securities = securitySchemes // May have to convert to an array of promises to resolve awaits
      .filter((scheme) => this.securities.includes(scheme.key))
      .map((scheme) => {
        return {
          type: scheme.type,
          key: scheme.key,
          scheme: scheme.scheme,
        };
      });

    const apiKey = flags.apiKey;
    let token = flags.bearerToken;
    const noPrompt = flags.noPrompt;
    for (const security of securities) {
      if (security.type === OASSecurityType.APIKEY) {
        const apiSecurityName = security.key;
        let apiKeyValue;
        if (!noPrompt && !apiKey) {
          apiKeyValue =
            // eslint-disable-next-line no-await-in-loop
            await cli.prompt('Please provide your API Key', {
              type: 'mask',
            });
        } else {
          apiKeyValue = apiKey;
        }
        // if apiKey is undefined, throw an error and provide a message to the user
        if (!apiKeyValue) {
          this.log('API key is undefined or empty.');
        }

        this.securityValues[apiSecurityName] = { value: apiKeyValue };
      }
      // Refactor logic to nest HTTP and OAUTH2 together in the same statement
      if (
        (security.type === OASSecurityType.HTTP &&
          security.scheme === BEARER_SECURITY_SCHEME) ||
        security.type === OASSecurityType.OAUTH2
      ) {
        const tokenSecurityName = security.key;
        let tokenValue;
        if (!noPrompt && !token) {
          tokenValue =
            // eslint-disable-next-line no-await-in-loop
            await cli.prompt('Please provide your token', {
              type: 'mask',
            });
          token = tokenValue;
        } else {
          tokenValue = token;
        }

        if (!tokenValue) {
          this.log('Bearer token is undefined or empty.');
        }

        if (security.type === OASSecurityType.HTTP) {
          this.securityValues[tokenSecurityName] = { value: tokenValue };
        }

        if (security.type === OASSecurityType.OAUTH2) {
          this.securityValues[tokenSecurityName] = {
            token: { access_token: tokenValue },
          };
        }
      }
    }
  };

  displayOperationResults = (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    failures: Map<string, ValidationFailure>,
    warnings: Map<string, ValidationWarning>,
  ): void => {
    if (failures.size > 0) {
      this.log(`${operation.operationId} - ${exampleGroup.name}: Failed`);

      failures.forEach((failure, _) => {
        const count = failure.count;
        this.log(
          `  - ${failure.toString()}. Found ${count} time${
            count > 1 ? 's' : ''
          }`,
        );
      });
    } else {
      this.log(`${operation.operationId} - ${exampleGroup.name}: Succeeded`);
    }

    warnings.forEach((warning, _) => {
      const count = warning.count;
      this.log(
        `  - ${warning.toString()}. Found ${count} time${count > 1 ? 's' : ''}`,
      );
    });
  };

  displayResults = (): void => {
    if (this.failingOperations.length > 0) {
      this.error(
        `${this.failingOperations.length} operation${
          this.failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
  };
}
