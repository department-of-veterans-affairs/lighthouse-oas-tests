import { OperationResult } from '../validation';
import { TestOptions } from '../config/config.interface';
import { SecurityValues } from 'swagger-client';
import OASSchema from '../oas-parsing/schema';

export interface SuiteConfig {
  options: TestOptions;
  schema: OASSchema;
  securityValues: SecurityValues;
}

// New test suites should be added under the '/suites/<suite name>' folder and defined in the SuiteFactory
abstract class Suite {
  public static suiteId = 'default-suite'; // Should be overriden in child suite
  protected static label = ''; // Should be overriden in child suite
  protected suiteConfig: SuiteConfig;

  constructor(suiteConfig: SuiteConfig) {
    this.suiteConfig = suiteConfig;
  }

  // conduct(): Expected to perform a series of related test case validations against an OAS
  //  and return an array of results.
  //  Should throw an error if testing cannot be performed due to a major issue (such as missing/invalid config)
  abstract conduct(): Promise<OperationResult[]>;

  // Should be overriden in child suite
  public getLabel(): string {
    return Suite.label;
  }
}

export default Suite;
