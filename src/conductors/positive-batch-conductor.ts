import FileIn from '../utilities/file-in';
import { OASResult } from '../results';
import PositiveConductor from './positive-conductor';
import { Config } from '../config';

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
            return new OASResult(name, undefined, (error as Error).message);
          }
        }

        return new OASResult(name, undefined, `Config ${name} missing path`);
      }),
    );
  }
}
