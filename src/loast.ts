import { TestOptions } from './config';
import { OASResult, OperationResult } from './validation';
import parseUrl from 'parse-url';
import { FILE_PROTOCOL } from './utilities/constants';
import OASSchema from './oas-parsing/schema';
import { FileIn } from './utilities/file-in';
import { SecurityValuesFactory } from './oas-parsing/security-values';
import { SuiteFactory, SuiteConfig } from './suites';

export default class Loast {
  private testName: string;
  private options: TestOptions;
  private suiteConfig!: SuiteConfig;
  private relevantSecuritySchemes;

  constructor(testName: string, options: TestOptions) {
    this.testName = testName;
    this.options = options;
  }

  // getResults(): Entry point for all LOAST testing (Whether by command line or by Node import).
  //  Conducts choosen test suites based on 'loastType' option and returns a set of test results per suite.
  public async getResults(): Promise<OASResult[]> {
    await this.populateSuiteConfig();

    const results: OASResult[] = [];
    let suiteIds = this.options.loastType;

    if (!suiteIds || suiteIds.length === 0) {
      suiteIds = SuiteFactory.availableSuiteIds();
    }

    await Promise.all(
      suiteIds.map(async (suiteId) => {
        results.push(await this.getSuiteResults(suiteId));
      }),
    );

    return results;
  }

  private async getSuiteResults(suiteId: string): Promise<OASResult> {
    const options = this.suiteConfig.options;
    let results: OperationResult[] = [];
    let suiteName = this.testName;
    let errorMsg: string | undefined;

    try {
      const suite = SuiteFactory.build(suiteId, this.suiteConfig);
      suiteName += ' ' + suite.getLabel();
      results = await suite.conduct();
    } catch (error) {
      errorMsg = (error as Error).message;
    }

    return new OASResult(
      suiteName,
      options.path,
      options.server,
      this.relevantSecuritySchemes,
      results,
      errorMsg,
    );
  }

  private async populateSuiteConfig(): Promise<void> {
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};

    const url = parseUrl(this.options.path);
    if (url.protocol === FILE_PROTOCOL) {
      oasSchemaOptions.spec = FileIn.loadSpecFromFile(this.options.path);
    } else {
      oasSchemaOptions.url = this.options.path;
    }

    const schema = new OASSchema(oasSchemaOptions);
    this.relevantSecuritySchemes = await schema.getRelevantSecuritySchemes();

    const securityValues = SecurityValuesFactory.buildFromSecuritySchemes(
      this.relevantSecuritySchemes,
      this.options.apiKey,
      this.options.token,
    );

    this.suiteConfig = {
      options: this.options,
      schema: schema,
      securityValues: securityValues,
    };
  }
}
