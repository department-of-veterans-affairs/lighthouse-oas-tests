import { TestOptions } from './config';
import { OASResult, OperationResult } from './validation';
import parsePath from 'parse-path';
import { FILE_PROTOCOL } from './utilities/constants';
import OASSchema from './oas-parsing/schema';
import { FileIn } from './utilities/file-in';
import { SuiteFactory, SuiteConfig } from './suites';
import { MissingSecuritySchemeError } from './Errors/MissingSecuritySchemeError';
import PositiveSuite from './suites/positive/positive-suite';

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
  //  Conducts choosen test suites based on 'suiteIds' option and returns a set of test results per suite.
  public async getResults(): Promise<OASResult[]> {
    this.populateSuiteConfig();
    const results: OASResult[] = [];
    let suiteIds = this.options.suiteIds;

    if (!suiteIds || suiteIds.length === 0) {
      suiteIds = SuiteFactory.availableSuiteIds();
    }

    await this.populateRelevantSecuritySchemas(suiteIds);

    await Promise.all(
      suiteIds.map(async (suiteId) => {
        results.push(await this.getSuiteResults(suiteId));
      }),
    );

    return results;
  }

  private async getSuiteResults(suiteId: string): Promise<OASResult> {
    const options = this.suiteConfig.options;
    let results: OperationResult[] | undefined;
    let suiteName = this.testName;
    let errorMsg: string | undefined;

    try {
      const suite = await SuiteFactory.build(suiteId, this.suiteConfig);
      suiteName += ' ' + suite.getLabel();
      results = await suite.conduct();
    } catch (error) {
      errorMsg = (error as Error).message;
    }

    return new OASResult(
      suiteId,
      suiteName,
      options.path,
      options.server,
      this.relevantSecuritySchemes,
      results,
      errorMsg,
    );
  }

  private populateSuiteConfig(): void {
    const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};

    const parsed = parsePath(this.options.path);
    if (parsed.protocol === FILE_PROTOCOL) {
      oasSchemaOptions.spec = FileIn.loadSpecFromFile(this.options.path);
    } else {
      oasSchemaOptions.url = this.options.path;
    }

    const schema = new OASSchema(oasSchemaOptions);

    this.suiteConfig = {
      options: this.options,
      schema: schema,
    };
  }

  private async populateRelevantSecuritySchemas(
    suiteIds: string[],
  ): Promise<void> {
    const { relevantSecuritySchemes, missingSecuritySchemes } =
      await this.suiteConfig.schema.getRelevantSecuritySchemes();

    // only the positive suite should throw an error if a security scheme is missing
    if (
      missingSecuritySchemes.length > 0 &&
      suiteIds.includes(PositiveSuite.suiteId)
    ) {
      throw new MissingSecuritySchemeError(missingSecuritySchemes);
    }

    this.relevantSecuritySchemes = relevantSecuritySchemes;
  }
}
