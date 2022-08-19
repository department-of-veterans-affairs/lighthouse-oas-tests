import { OperationResult } from '../../validation';
import Suite from '../suite';
import SpectralValidator from './validation/spectral-validator';

export default class SpectralSuite extends Suite {
  public static suiteId = 'spectral';
  public static label = '(Spetral)';

  async conduct(): Promise<OperationResult[]> {
    const operations = await this.suiteConfig.schema.getOperations(); // TODO remove

    const spectralValidator = new SpectralValidator();
    spectralValidator.validate();

    // Run spectral test

    // Parse results

    // Map parts of results to new OperationResult()

    // Map final results to new returned value

    return [];
  }

  public getLabel(): string {
    return SpectralSuite.label;
  }
}
