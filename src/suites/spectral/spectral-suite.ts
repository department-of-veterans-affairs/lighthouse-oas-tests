import { OperationResult } from '../../validation';
import Suite from '../suite';
import SpectralValidator from './validation/spectral-validator';

export default class SpectralSuite extends Suite {
  public static suiteId = 'spectral';
  public static label = '(Spectral)';

  async conduct(): Promise<OperationResult[]> {
    const operations = await this.suiteConfig.schema.getOperations();
    const results: OperationResult[] = [];

    for (let x = 0; x < operations.length; x++) {
      const operation = operations[x];
      const operationId = operations[x].operationId;

      // get the original operation ID
      const originalOperationId = operation.operation.__originalOperationId;

      const spectralValidator = new SpectralValidator(operation);
      spectralValidator.validate();

      const result = new OperationResult(
        operationId,
        originalOperationId,
        'Generic Spectral validation',
        spectralValidator.failures,
        spectralValidator.warnings,
      );

      results.push(result);
    }

    return results;
  }

  public getLabel(): string {
    return SpectralSuite.label;
  }
}
