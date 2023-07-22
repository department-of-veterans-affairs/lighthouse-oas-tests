import { OperationResult } from '../../validation';
import Suite, { SuiteConfig } from '../suite';
import RulesetValidator from './validation/ruleset-validator';

/**
 * Reviews the OAS following the rules defined.
 * This uses spectral to define the rules.
 * Logic expects a corresponding sibling '<ruleset>.yaml' file to contain relevant rules for Spectral
 */
export default class RulesetSuite extends Suite {
  private rulesetName: string;
  private rulesetLabel: string;
  private rulesetValidator!: RulesetValidator;

  constructor(rulesetName: string) {
    super();
    this.rulesetName = rulesetName;
    this.rulesetLabel = '(' + rulesetName + ')';
  }

  public async setup(suiteConfig: SuiteConfig): Promise<void> {
    await super.setup(suiteConfig);

    this.rulesetValidator = new RulesetValidator(
      suiteConfig.schema,
      this.rulesetName,
    );
  }

  async conduct(): Promise<OperationResult[]> {
    const results: OperationResult[] = [];

    await this.rulesetValidator.validate();

    const operationMap = this.rulesetValidator.operationMap;
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
    return this.rulesetLabel;
  }
}
