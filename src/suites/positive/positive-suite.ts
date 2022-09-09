import { OperationResult } from '../../validation';
import { OperationExampleFactory } from '../../oas-parsing/operation-example';
import { ValidationConductor } from './conductors';
import Suite from '../suite';

export default class PositiveSuite extends Suite {
  public static suiteId = 'positive';

  protected static label = '(Example Group: 2xx Response)';

  async conduct(): Promise<OperationResult[]> {
    this.checkTargetServer();

    if (!this.suiteConfig.securityValues) {
      throw new Error('Unable to run suite due to missing securityValues');
    }

    const securityValues = this.suiteConfig.securityValues;
    const operations = await this.suiteConfig.schema.getOperations();
    const operationExamples =
      OperationExampleFactory.buildFromOperations(operations);

    const results = await Promise.all(
      operationExamples.map(async (operationExample) => {
        const validationConductor = new ValidationConductor(
          this.suiteConfig.schema,
          operationExample,
          securityValues,
          this.suiteConfig.options.server,
        );
        return validationConductor.validate();
      }),
    );

    return results;
  }

  private async checkTargetServer(): Promise<void> {
    const targetServer = this.suiteConfig.options.server;
    const servers = await this.suiteConfig.schema.getServers();

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
