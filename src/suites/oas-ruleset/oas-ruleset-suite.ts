import { OperationResult } from '../../validation';
import Suite, { SuiteConfig } from '../suite';
import OasRulesetValidator from './validation/oas-ruleset-validator';

/**
 * Reviews the OAS following the rules defined.
 * This uses spectral to define the rules.
 */
export default class OasRulesetSuite extends Suite {
  public static suiteId = 'oas-ruleset';
  public static label = '(oas-ruleset)';

  constructor(suiteConfig: SuiteConfig) {
    super(suiteConfig);
    this.suiteConfig = suiteConfig;
  }

  async conduct(): Promise<OperationResult[]> {
    const results: OperationResult[] = [];

    const oasRulesetValidator = new OasRulesetValidator(
      this.suiteConfig.schema,
    );
    await oasRulesetValidator.validate();

    const operationMap = oasRulesetValidator.operationMap;
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
