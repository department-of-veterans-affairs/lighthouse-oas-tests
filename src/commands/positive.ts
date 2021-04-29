import yaml from 'js-yaml';
import loadJsonFile from 'load-json-file';
import parseUrl from 'parse-url';
import { extname, resolve } from 'path';
import { readFileSync } from 'fs';
import { ApiKeyCommand } from '../baseCommands';
import OASSchema from '../utilities/oas-schema';
import { InvalidResponse } from '../validation-messages/failures';
import { ParameterValidator, ResponseValidator } from '../utilities/validators';
import {
  OperationExample,
  OperationFailures,
  OperationResponse,
  OperationWarnings,
} from './types';

export default class Positive extends ApiKeyCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = ApiKeyCommand.flags;

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
    const { args } = this.parse(Positive);
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {
      authorizations: { apikey: { value: this.apiKey } },
    };

    const path = parseUrl(args.path);

    if (path.protocol === 'file') {
      const extension = extname(args.path);

      if (extension === '.json') {
        try {
          const spec = await loadJsonFile(args.path);
          oasSchemaOptions.spec = spec;
        } catch (error) {
          this.error('unable to load json file');
        }
      } else if (extension === '.yml' || extension === '.yaml') {
        try {
          const file = readFileSync(resolve(args.path));
          const spec = yaml.load(file);
          oasSchemaOptions.spec = spec;
        } catch (error) {
          this.error('unable to load yaml file');
        }
      } else {
        this.error(
          'File is of a type not supported by OAS (.json, .yml, .yaml)',
        );
      }
    } else {
      oasSchemaOptions.url = args.path;
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
