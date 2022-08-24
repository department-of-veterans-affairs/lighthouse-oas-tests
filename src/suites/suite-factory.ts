/* eslint-disable indent */
import { Suite, SuiteConfig } from '../suites';
import PositiveSuite from './positive/positive-suite';
import SpectralSuite from './spectral/spectral-suite';

//  Additional test suites simply need to be defined here to be included in Loast
export default class SuiteFactory {
  public static build(suiteId: string, config: SuiteConfig): Suite {
    switch (suiteId) {
      case PositiveSuite.suiteId:
        return new PositiveSuite(config);
      case SpectralSuite.suiteId:
        return new SpectralSuite(config);
      default:
        throw new Error(`Unable to find suite with ID ${suiteId}`);
    }
  }

  public static availableSuiteIds(): string[] {
    return [PositiveSuite.suiteId, SpectralSuite.suiteId];
  }
}
