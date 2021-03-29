import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import { DEFAULT_PARAMETER_GROUP } from '../utilities/constants';
import OASSchema from '../utilities/oas-schema';
import ValidationFailure from '../validation-failures/validation-failure';
import OASOperation from '../utilities/oas-operation';
import { ParameterValidator, ResponseValidator } from '../utilities/validators';
import { OperationResponse } from './types';

export default class Positive extends ApiKeyCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = {
    ...ApiKeyCommand.flags,
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

  private operations!: OASOperation[];

  private operationFailures!: {
    [operationExampleId: string]: ValidationFailure[];
  };

  async run(): Promise<void> {
    const { args, flags } = this.parse(Positive);
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {
      authorizations: { apikey: { value: this.apiKey } },
    };

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
    this.operations = await this.schema.getOperations();

    this.operationFailures = {};

    this.validateParameters();

    const responses = await Promise.all(this.executeRequests());

    const mergedResponses = responses.reduce((merged, response) => {
      return Object.assign(merged, response);
    }, {});

    this.validateResponses(mergedResponses);

    this.displayResults();
  }

  validateParameters = (): void => {
    for (const operation of this.operations) {
      const exampleGroups = operation.getExampleGroups();

      for (const exampleGroup of exampleGroups) {
        const operationExampleId = `${operation.getOperationId()}:${exampleGroup.getName()}`;
        const validator = new ParameterValidator(exampleGroup);
        validator.validate();

        this.operationFailures[operationExampleId] = validator.getFailures();
      }
    }
  };

  validateResponses = (responses: OperationResponse): void => {
    for (const operation of this.operations) {
      for (const exampleGroup of operation.getExampleGroups()) {
        const operationExampleId = `${operation.getOperationId()}:${exampleGroup.getName()}`;

        const response = responses[operationExampleId];
        if (response) {
          if (response.ok) {
            const validator = new ResponseValidator(operation, response);
            validator.validate();

            this.operationFailures[
              operationExampleId
            ] = validator.getFailures();
          } else {
            this.operationFailures[operationExampleId] = [
              new ValidationFailure(
                'Response status code was a non 2XX value',
                [],
              ),
            ];
          }
        }
      }
    }
  };

  executeRequests = (): Promise<OperationResponse>[] => {
    const responses: Promise<OperationResponse>[] = [];
    for (const operation of this.operations) {
      for (const exampleGroup of operation.getExampleGroups()) {
        const operationExampleId = `${operation.getOperationId()}:${exampleGroup.getName()}`;
        if (this.operationFailures[operationExampleId].length === 0) {
          responses.push(
            this.schema.execute(operation, exampleGroup).then((response) => {
              return {
                [operationExampleId]: response,
              };
            }),
          );
        }
      }
    }

    return responses;
  };

  displayResults = (): void => {
    const failingOperations: string[] = [];

    for (const operation of this.operations) {
      const operationId = operation.getOperationId();

      for (const exampleGroup of operation.getExampleGroups()) {
        const exampleGroupName = exampleGroup.getName();
        const operationExampleId = `${operationId}:${exampleGroupName}`;
        const failures = this.operationFailures[operationExampleId];

        if (failures.length > 0) {
          failingOperations.push(operationExampleId);
          this.log(
            `${operationId}${
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
            `${operationId}${
              exampleGroupName === DEFAULT_PARAMETER_GROUP
                ? ''
                : ` - ${exampleGroupName}`
            }: Succeeded`,
          );
        }
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
