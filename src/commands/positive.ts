import Command, { flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import loadJsonFile from 'load-json-file';
import { uniq } from 'lodash';
import parseUrl from 'parse-url';
import { extname, resolve } from 'path';
import { Security } from 'swagger-client';
import { BEARER_SECURITY_SCHEME } from '../utilities/constants';
import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import OASSchema from '../utilities/oas-schema';
import { OASSecurityType } from '../utilities/oas-security';
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
import PDFBuilder from '../utilities/pdf-builder/pdf-builder';

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
    const pdfBuilder: PDFBuilder = new PDFBuilder('./output.pdf');

    if (path.protocol === 'file') {
      let spec;
      const extension = extname(args.path);

      if (extension === '.json') {
        try {
          spec = await loadJsonFile(args.path);
        } catch (error) {
          this.error('unable to load json file');
        }
      } else if (extension === '.yml' || extension === '.yaml') {
        try {
          const file = readFileSync(resolve(args.path));
          spec = yaml.load(file);
        } catch (error) {
          this.error('unable to load yaml file');
        }
      } else {
        this.error(
          'File is of a type not supported by OAS (.json, .yml, .yaml)',
        );
      }
      oasSchemaOptions.spec = spec;
    } else {
      oasSchemaOptions.url = args.path;
    }

    this.schema = new OASSchema(oasSchemaOptions);
    const spec = (await this.schema.client).spec;

    this.securities = await this.getSecurities();

    if (this.securities.length > 0) {
      await this.promptForSecurityValues(flags);
    }

    await this.buildOperationExamples();

    await Promise.all(
      this.operationExamples.map(async (operationExample) => {
        let failures: ValidationFailure[] = [];
        let warnings: ValidationWarning[] = [];
        const { operation, exampleGroup } = operationExample;
        const parameterSchemaValidator = new ParameterSchemaValidator(
          operation,
        );
        parameterSchemaValidator.validate();

        failures = [...failures, ...parameterSchemaValidator.failures];
        warnings = [...warnings, ...parameterSchemaValidator.warnings];

        const parameterValidator = new ExampleGroupValidator(exampleGroup);
        parameterValidator.validate();

        failures = [...failures, ...parameterValidator.failures];
        warnings = [...warnings, ...parameterValidator.warnings];

        if (failures.length === 0) {
          const { request, response } = await this.schema.execute(
            operation,
            exampleGroup,
            this.securityValues,
          );
          if (response?.ok) {
            const validator = new ResponseValidator(operation, response);
            validator.validate();

            failures = [...failures, ...validator.failures];
            warnings = [...warnings, ...validator.warnings];
          } else if (response) {
            failures = [...failures, new InvalidResponse(request)];
          }
        }

        if (failures.length > 0) {
          this.failingOperations.push(operation);
        }

        pdfBuilder.addOperationResults(
          operation,
          exampleGroup,
          failures,
          warnings,
        );
        this.displayOperationResults(
          operation,
          exampleGroup,
          failures,
          warnings,
        );
      }),
    );

    pdfBuilder.addResultsSummary(this.failingOperations);
    const title = spec.info.title ?? 'Unknown API';
    const version = spec.info.version ?? 'Unspecified Version';
    const success = this.failingOperations.length === 0;
    pdfBuilder.addCoverPage(title, version, success, this.failingOperations);
    pdfBuilder.build();
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

    const securityTypes = {};
    for (const scheme of securitySchemes) {
      if (this.securities.includes(scheme.key)) {
        securityTypes[scheme.type] = {
          type: scheme.type,
          key: scheme.key,
          scheme: scheme.scheme,
        };
      }
    }

    if (securityTypes[OASSecurityType.APIKEY]) {
      const apiSecurityName = securityTypes[OASSecurityType.APIKEY].key;
      const value =
        flags.apiKey ??
        (await cli.prompt('Please provide your API Key', { type: 'mask' }));

      this.securityValues[apiSecurityName] = { value };
    }

    if (securityTypes[OASSecurityType.HTTP]) {
      const bearerSecurityName = securityTypes[OASSecurityType.HTTP].key;
      let value;

      if (
        securityTypes[OASSecurityType.HTTP].scheme === BEARER_SECURITY_SCHEME
      ) {
        value =
          flags.bearerToken ??
          (await cli.prompt('Please provide your bearer token', {
            type: 'mask',
          }));
      }

      this.securityValues[bearerSecurityName] = { value };
    }
  };

  displayOperationResults = (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    failures: ValidationFailure[],
    warnings: ValidationWarning[],
  ): void => {
    if (failures.length > 0) {
      this.log(`${operation.operationId} - ${exampleGroup.name}: Failed`);

      failures.forEach((failure) => {
        this.log(`  - ${failure.toString()}`);
      });
    } else {
      this.log(`${operation.operationId} - ${exampleGroup.name}: Succeeded`);
    }

    warnings.forEach((warning) => {
      this.log(`  - Warning: ${warning.toString()}`);
    });
  };

  displayResults = (): void => {
    if (this.failingOperations.length > 0) {
      this.warn(
        `${this.failingOperations.length} operation${
          this.failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
  };
}
