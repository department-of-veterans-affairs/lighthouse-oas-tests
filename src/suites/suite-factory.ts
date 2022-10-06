import { Suite, SuiteConfig } from '../suites';
import PositiveSuite from './positive/positive-suite';
import OasRulesetSuite from './oas-ruleset/oas-ruleset-suite';

// Additional test suites simply need to be defined here to be included in Loast
export default class SuiteFactory {
  public static async build(
    suiteId: string,
    config: SuiteConfig,
  ): Promise<Suite> {
    let suite;

    switch (suiteId) {
      case PositiveSuite.suiteId:
        suite = new PositiveSuite();
        break;
      case OasRulesetSuite.suiteId:
        suite = new OasRulesetSuite();
        break;
      default:
        throw new Error(`Unable to find suite with ID ${suiteId}`);
    }

    await suite.setup(config);
    return suite;
  }

  public static availableSuiteIds(): string[] {
    return [PositiveSuite.suiteId, OasRulesetSuite.suiteId];
  }
}
