import { OASResult } from '../validation/results';
import PositiveConductor from './positive-conductor';
import { Config } from '../config';
import { FileIn } from '../utilities/file-in';

export default class PositiveBatchConductor {
  private config: Config;

  constructor(path: string) {
    this.config = FileIn.loadConfigFromFile(path);
  }

  async conduct(): Promise<OASResult[]> {
    return Promise.all(
      Object.entries(this.config).map(async ([name, testInputs]) => {
        if (testInputs.path) {
          try {
            const positiveConductor = new PositiveConductor(name, testInputs);
            const result = await positiveConductor.conduct();
            return result;
          } catch (error) {
            return new OASResult(
              name,
              testInputs.path,
              testInputs.server,
              [],
              undefined,
              (error as Error).message,
            );
          }
        }

        return new OASResult(
          name,
          testInputs.path,
          testInputs.server,
          [],
          undefined,
          `Config ${name} missing path`,
        );
      }),
    );
  }
}
