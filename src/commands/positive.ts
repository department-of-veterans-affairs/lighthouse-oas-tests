import { flags } from '@oclif/command';
import { cli } from 'cli-ux';
import loadJsonFile from 'load-json-file';
import { ApiCommand } from '../baseCommands';
import { DEFAULT_PARAMETER_GROUP } from '../utilities/constants';
import OASSchema from '../utilities/oas-schema';
import { InvalidResponse } from '../validation-messages/failures';
import { ParameterValidator, ResponseValidator } from '../utilities/validators';
import {
  OperationExample,
  OperationFailures,
  OperationResponse,
  SecurityFailures,
  OperationWarnings,
} from './types';
import {
  OASSecurityScheme,
  OASSecurityType,
} from '../utilities/oas-security/oas-security-scheme';
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

    this.schema = new OASSchema(oasSchemaOptions);

    await this.setTopSecurity(flags);

    await this.buildOperationExamples();

    this.validateParameters();

    const responses = await Promise.all(this.executeRequests(flags));

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

  setTopSecurity = async (flags: {
    apiKey: string | undefined;
  }): Promise<void> => {
    const securitySchemes = await this.schema.getSecuritySchemes();
    const topSecurities = await this.schema.getTopSecurities();
    const securityTypes = {};
    for (const scheme of securitySchemes) {
      securityTypes[OASSecurityType.APIKEY] =
        this.getAPISecurityKey(scheme, flags) ??
        securityTypes[OASSecurityType.APIKEY];
    }
    if (this.securityFailures[OASSecurityType.APIKEY]) {
      flags.apiKey = (await cli.prompt('What is your apiKey?', {
        type: 'mask',
      })) as string;
      delete this.securityFailures[OASSecurityType.APIKEY];
    }
    if (
      securityTypes[OASSecurityType.APIKEY] &&
      topSecurities[securityTypes[OASSecurityType.APIKEY]]
    ) {
      this.schema.setAPISecurity(flags.apiKey as string);
    }
  };

  getAPISecurityKey = (
    scheme: OASSecurityScheme,
    flags: { apiKey: string | undefined },
  ): string | undefined => {
    if (scheme.securityType !== OASSecurityType.APIKEY) {
      return;
    }
    if (!flags.apiKey) {
      this.securityFailures[OASSecurityType.APIKEY] = [new MissingAPIKey()];
    }
    return scheme.name;
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

  executeRequests = (flags: {
    apiKey: string | undefined;
  }): Promise<OperationResponse>[] => {
    const responses: Promise<OperationResponse>[] = [];
    for (const { id, exampleGroup, operation } of this.operationExamples) {
      if (this.operationFailures[id].length === 0) {
        responses.push(
          this.schema
            .execute(operation, exampleGroup, flags)
            .then((response) => {
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
