import Command, { flags } from '@oclif/command';
import { cli } from 'cli-ux';
import loadJsonFile from 'load-json-file';
import OASSchema from '../utilities/oas-schema';
import { InvalidResponse } from '../validation-messages/failures';
import { ParameterValidator, ResponseValidator } from '../utilities/validators';
import {
  OperationExample,
  OperationFailures,
  OperationResponse,
  OperationWarnings,
} from './types';
import { OASSecurityType } from '../utilities/oas-security/oas-security-scheme';
import { Authorized, Security } from 'swagger-client';
import { OASSecurityFactory } from '../utilities/oas-security';
import { OpenAPIObject } from 'swagger-client/schema';

export default class Positive extends Command {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({
      char: 'a',
      env: 'API_KEY',
      description: 'API key to use',
    }),
    file: flags.boolean({
      char: 'f',
      description: 'Provide this flag if the path is to a local file',
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

  private operationFailures: OperationFailures = {};

  private operationWarnings: OperationWarnings = {};

  async run(): Promise<void> {
    const { args, flags } = this.parse(Positive);
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};

    if (flags.file) {
      try {
        const json = await loadJsonFile(args.path);
        oasSchemaOptions.spec = json;
      } catch (error) {
        this.error('unable to load json file');
      }
    } else {
      oasSchemaOptions.url = args.path;
    }

    const apiKey = await this.promptForAPISecurity(flags, oasSchemaOptions);

    if (apiKey) {
      oasSchemaOptions.securities = {
        authorized: {
          ...oasSchemaOptions.securities?.authorized,
          [apiKey.key]: apiKey.security[apiKey.key],
        },
      };
    }

    this.schema = new OASSchema(oasSchemaOptions);

    await this.buildOperationExamples();

    this.validateParameters();

    const responses = await Promise.all(this.executeRequests());

    const mergedResponses = responses.reduce((merged, response) => {
      return Object.assign(merged, response);
    }, {});

    this.validateResponses(mergedResponses);

    this.displayResults();
  }

  buildOperationExamples = async (): Promise<void> => {
    const operations = await this.schema.getOperations();
    for (const operation of operations) {
      const exampleGroups = operation.exampleGroups;

      for (const exampleGroup of exampleGroups) {
        const operationExampleId = `${operation.operationId}:${exampleGroup.name}`;
        this.operationFailures[operationExampleId] = [];
        this.operationWarnings[operationExampleId] = [];
        this.operationExamples.push({
          id: operationExampleId,
          operation,
          exampleGroup,
        });
      }
    }
  };

  promptForAPISecurity = async (
    flags: { apiKey: string | undefined },
    oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0],
  ): Promise<{ key: string; security: Security } | undefined> => {
    const spec = oasSchemaOptions.spec;
    if (!spec.components || !spec.components.securitySchemes) {
      return;
    }
    const securitySchemes = OASSecurityFactory.getSecuritySchemes(
      spec.components.securitySchemes,
    );
    const securityTypes = {};
    for (const scheme of securitySchemes) {
      if (scheme.securityType === OASSecurityType.APIKEY && scheme.name) {
        securityTypes[OASSecurityType.APIKEY] = scheme.name;
      }
    }
    if (securityTypes[OASSecurityType.APIKEY] && !flags.apiKey) {
      flags.apiKey = (await cli.prompt('What is your apiKey?', {
        type: 'mask',
      })) as string;
    }

    if (flags.apiKey) {
      return {
        key: securityTypes[OASSecurityType.APIKEY],
        security: {
          [securityTypes[OASSecurityType.APIKEY]]: {
            value: flags.apiKey,
          },
        },
      };
    }
  };

  validateParameters = (): void => {
    for (const { id, exampleGroup } of this.operationExamples) {
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      this.operationFailures[id] = validator.failures;
    }
  };

  validateResponses = (responses: OperationResponse): void => {
    for (const { id, operation } of this.operationExamples) {
      const response = responses[id];
      if (response?.ok) {
        const validator = new ResponseValidator(operation, response);
        validator.validate();

        this.operationFailures[id] = validator.failures;
        this.operationWarnings[id] = validator.warnings;
      } else if (response) {
        this.operationFailures[id] = [new InvalidResponse()];
      }
    }
  };

  executeRequests = (): Promise<OperationResponse>[] => {
    const responses: Promise<OperationResponse>[] = [];
    for (const { id, exampleGroup, operation } of this.operationExamples) {
      if (this.operationFailures[id].length === 0) {
        responses.push(
          this.schema.execute(operation, exampleGroup).then((response) => {
            return {
              [id]: response,
            };
          }),
        );
      }
    }

    return responses;
  };

  displayResults = (): void => {
    const failingOperations: string[] = [];
    for (const { id, exampleGroup, operation } of this.operationExamples) {
      const exampleGroupName = exampleGroup.name;
      const failures = this.operationFailures[id];
      const warnings = this.operationWarnings[id];

      if (failures.length > 0) {
        failingOperations.push(id);
        this.log(`${operation.operationId} - ${exampleGroupName}: Failed`);

        failures.forEach((failure) => {
          this.log(`  - ${failure.toString()}`);
        });
      } else {
        this.log(`${operation.operationId} - ${exampleGroupName}: Succeeded`);
      }

      warnings.forEach((failure) => {
        this.log(`  - ${failure.toString()}`);
      });
    }

    if (failingOperations.length > 0) {
      this.error(
        `${failingOperations.length} operation${
          failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
  };
}
