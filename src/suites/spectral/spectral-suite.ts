import { OperationResult } from '../../validation';
import Suite from '../suite';
import SpectralValidator from './validation/spectral-validator';

export default class SpectralSuite extends Suite {
  public static suiteId = 'spectral';
  protected static label = '(Spectral)';

  async conduct(): Promise<OperationResult[]> {
    const results: OperationResult[] = [];

    const spectralValidator = new SpectralValidator(this.suiteConfig.schema);
    await spectralValidator.validate();

    const operationMap = spectralValidator.operationMap;
    const operations = operationMap.keys();

    for (const operationId of operations) {
      const ruleMap = operationMap.get(operationId);

      if (ruleMap) {
        const rules = ruleMap.keys();

        for (const testGroupName of rules) {
          const messageSet = ruleMap.get(testGroupName);
          const failures = messageSet ? messageSet?.failures : new Map();
          const warnings = messageSet ? messageSet?.warnings : new Map();

          results.push(
            new OperationResult(
              operationId,
              operationId,
              testGroupName,
              failures,
              warnings,
            ),
          );
        }
      }
    }

    return results;
  }

  public getLabel(): string {
    return SpectralSuite.label;
  }
}
