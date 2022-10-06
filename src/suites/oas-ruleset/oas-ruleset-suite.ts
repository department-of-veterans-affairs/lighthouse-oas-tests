import { OperationResult } from '../../validation';
import Suite, { SuiteConfig } from '../suite';
import OasRulesetValidator from './validation/oas-ruleset-validator';

/**
 * Reviews the OAS following the rules defined.
 * This uses spectral to define the rules.
 */
export default class OasRulesetSuite extends Suite {
  public static suiteId = 'oas-ruleset';
  protected static label = '(oas-ruleset)';
  private oasRulesetValidator!: OasRulesetValidator;

  public async setup(suiteConfig: SuiteConfig): Promise<void> {
    await super.setup(suiteConfig);

    this.oasRulesetValidator = new OasRulesetValidator(suiteConfig.schema);
  }

  async conduct(): Promise<OperationResult[]> {
    const results: OperationResult[] = [];

    await this.oasRulesetValidator.validate();

    const operationMap = this.oasRulesetValidator.operationMap;
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
    return OasRulesetSuite.label;
  }
}
