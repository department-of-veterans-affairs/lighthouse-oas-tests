import { OperationResult } from '../../validation';
import {
  OperationExample,
  OperationExampleFactory,
} from '../../oas-parsing/operation-example';
import { ValidationConductor } from './conductors';
import Suite, { SuiteConfig } from '../suite';
import { SecurityValues } from 'swagger-client';
import { SecurityValuesFactory } from '../../oas-parsing/security-values';
import OASSchema from '../../oas-parsing/schema';

export default class PositiveSuite extends Suite {
  public static suiteId = 'positive';

  protected static label = '(Example Group: 2xx Response)';

  private schema!: OASSchema;
  private server!: string | undefined;
  private securityValues!: SecurityValues;
  private operationExamples!: OperationExample[];

  public async setup(suiteConfig: SuiteConfig): Promise<void> {
    await super.setup(suiteConfig);

    this.server = suiteConfig.options.server;
    this.schema = suiteConfig.schema;
    const relevantSecuritySchemes =
      await this.schema.getRelevantSecuritySchemes();

    this.securityValues = SecurityValuesFactory.buildFromSecuritySchemes(
      relevantSecuritySchemes,
      suiteConfig.options.apiKey,
      suiteConfig.options.token,
    );

    const operations = await this.schema.getOperations();
    this.operationExamples =
      OperationExampleFactory.buildFromOperations(operations);
  }

  async conduct(): Promise<OperationResult[]> {
    this.checkTargetServer();

    const results = await Promise.all(
      this.operationExamples.map(async (operationExample) => {
        const validationConductor = new ValidationConductor(
          this.schema,
          operationExample,
          this.securityValues,
          this.server,
        );
        return validationConductor.validate();
      }),
    );

    return results;
  }

  private async checkTargetServer(): Promise<void> {
    const targetServer = this.server;
    const servers = await this.schema.getServers();

    if (!targetServer && servers.length > 1) {
      throw new Error(
        'Server value must be specified if OAS contains more than one server',
      );
    }

    if (targetServer) {
      const urls = servers.map((server) => server.url);
      if (!urls.includes(targetServer)) {
        throw new Error(
          'Server value must match one of the server URLs in the OAS',
        );
      }
    }
  }

  public getLabel(): string {
    return PositiveSuite.label;
  }
}
