import parseUrl from 'parse-url';
import { FILE_PROTOCOL } from '../utilities/constants';
import FileIn from '../utilities/file-in';
import OASSchema from '../utilities/oas-schema';
import { OASResult } from '../results';
import { TestOptions } from '../config';
import ValidationConductor from '../validation-conductors';
import SecurityValuesFactory from '../utilities/security-values';
import { OperationExampleFactory } from '../utilities/operation-example';

export default class PositiveConductor {
  private testName: string;

  private apiKey: string | undefined;

  private server: string | undefined;

  private schema: OASSchema;

  private token: string | undefined;

  constructor(testName: string, { path, server, apiKey, token }: TestOptions) {
    this.testName = testName;
    this.server = server;
    this.apiKey = apiKey;
    this.token = token;

    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};

    const url = parseUrl(path);
    if (url.protocol === FILE_PROTOCOL) {
      oasSchemaOptions.spec = FileIn.loadSpecFromFile(path);
    } else {
      oasSchemaOptions.url = path;
    }

    this.schema = new OASSchema(oasSchemaOptions);
  }

  async conduct(): Promise<OASResult> {
    await this.validateServerOption();

    const relevantSecuritySchemes =
      await this.schema.getRelevantSecuritySchemes();
    const securityValues = SecurityValuesFactory.buildFromSecuritySchemes(
      relevantSecuritySchemes,
      this.apiKey,
      this.token,
    );

    const operations = await this.schema.getOperations();
    const operationExamples =
      OperationExampleFactory.buildFromOperations(operations);

    const results = await Promise.all(
      operationExamples.map(async (operationExample) => {
        const validationConductor = new ValidationConductor(
          this.schema,
          operationExample,
          securityValues,
          this.server,
        );
        return validationConductor.validate();
      }),
    );

    return new OASResult(this.testName, results, undefined);
  }

  private async validateServerOption(): Promise<void> {
    const servers = await this.schema.getServers();

    if (!this.server && servers.length > 1) {
      throw new Error(
        'Server value must be specified if OAS contains more than one server',
      );
    }

    if (this.server) {
      const urls = servers.map((server) => server.url);
      if (!urls.includes(this.server)) {
        throw new Error(
          'Server value must match one of the server URLs in the OAS',
        );
      }
    }
  }
}
