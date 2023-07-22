import fs from 'fs';
import path from 'path';
import { Suite, SuiteConfig } from '../suites';
import PositiveSuite from './positive/positive-suite';
import RulesetSuite from './rulesets/ruleset-suite';

// Additional test suites simply need to be defined here to be included in Loast
export default class SuiteFactory {
  public static async build(
    suiteId: string,
    config: SuiteConfig,
  ): Promise<Suite> {
    let suite;

    if (suiteId === PositiveSuite.suiteId) {
      suite = new PositiveSuite();
    } else if (SuiteFactory.rulesetSuiteIds().includes(suiteId)) {
      suite = new RulesetSuite(suiteId);
    } else {
      throw new Error(`Unable to find suite with ID ${suiteId}`);
    }

    await suite.setup(config);
    return suite;
  }

  public static availableSuiteIds(): string[] {
    const suiteIds = SuiteFactory.rulesetSuiteIds();
    suiteIds.push(PositiveSuite.suiteId);

    return suiteIds;
  }

  private static rulesetSuiteIds(): string[] {
    const rulesetFolder = path.resolve(__dirname, 'rulesets');
    const rulesetSuiteIds = fs
      .readdirSync(rulesetFolder, { withFileTypes: true })
      .filter((item) => !item.isDirectory() && item.name.endsWith('.yaml'))
      .map((item) => item.name.replace('.yaml', ''));

    return rulesetSuiteIds;
  }
}
