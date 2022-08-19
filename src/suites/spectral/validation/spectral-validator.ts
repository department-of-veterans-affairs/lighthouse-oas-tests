import { BaseValidator } from '../../../validation';
import SpectralMessage, { Type } from './spectral-message';

class SpectralValidator extends BaseValidator {
  performValidation = (): void => {
    this.testValidate([]);
  };

  public addMessage(type: unknown, path: string[], props?: string[]): void {
    const message = new SpectralMessage(type, path, props);
    const map = message.isError() ? this._failures : this._warnings;
    const existingMessage = map.get(message.hash);

    if (existingMessage) {
      existingMessage.incrementCount();
    } else {
      map.set(message.hash, message);
    }
  }

  public testValidate(path: string[]): void {
    this.addMessage(Type.GenericSpectralWarning, path);
    this.addMessage(Type.GenericSpectralError, path);
  }
}

export default SpectralValidator;
