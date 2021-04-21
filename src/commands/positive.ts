import { flags } from '@oclif/command';
import { cli } from 'cli-ux';
import loadJsonFile from 'load-json-file';
import { ApiCommand } from '../baseCommands';
import { DEFAULT_PARAMETER_GROUP } from '../utilities/constants';
import OASSchema from '../utilities/oas-schema';
import ValidationFailure from '../validation-failures/validation-failure';
import { ParameterValidator, ResponseValidator } from '../utilities/validators';
import {
  OperationExample,
  OperationFailures,
  OperationResponse,
  SecurityFailures,
} from './types';
import { OASSecurityType } from '../utilities/oas-security/oas-security-scheme';
import MissingAPIKey from '../security-failures/missing-apikey';

export default class Positive extends ApiCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = {
    ...ApiCommand.flags,
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

  private securityFailures: SecurityFailures = {};

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

    this.schema = new OASSchema(oasSchemaOptions);

    await this.validateSecurity(flags.apiKey);

    if (this.securityFailures[OASSecurityType.APIKEY]) {
      flags.apiKey = (await cli.prompt('What is your apiKey?', {
        type: 'mask',
      })) as string;
      delete this.securityFailures[OASSecurityType.APIKEY];
      this.schema.setAPISecurity(flags.apiKey);
    }

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
        this.operationExamples.push({
          id: operationExampleId,
          operation,
          exampleGroup,
        });
      }
    }
  };

  validateSecurity = async (apiKey?: string): Promise<void> => {
    const securitySchemes = await this.schema.getSecuritySchemes();
    for (const scheme of securitySchemes) {
      if (scheme.securityType === OASSecurityType.APIKEY && !apiKey) {
        this.securityFailures[OASSecurityType.APIKEY] = [new MissingAPIKey()];
      }
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
      } else if (response) {
        this.operationFailures[id] = [
          new ValidationFailure('Response status code was a non 2XX value', []),
        ];
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

      if (failures.length > 0) {
        failingOperations.push(id);
        this.log(
          `${operation.operationId}${
            exampleGroupName === DEFAULT_PARAMETER_GROUP
              ? ''
              : ` - ${exampleGroupName}`
          }: Failed`,
        );

        failures.forEach((failure) => {
          this.log(`  - ${failure.toString()}`);
        });
      } else {
        this.log(
          `${operation.operationId}${
            exampleGroupName === DEFAULT_PARAMETER_GROUP
              ? ''
              : ` - ${exampleGroupName}`
          }: Succeeded`,
        );
      }
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
