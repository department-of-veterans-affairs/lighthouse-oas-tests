import OASOperation from '../../../oas-parsing/operation/oas-operation';
import { BaseValidator } from '../../../validation';
import SpectralMessage, { Type } from './spectral-message';

class SpectralValidator extends BaseValidator {
  private operation: OASOperation;

  constructor(operation: OASOperation) {
    super();
    this.operation = operation;
  }

  performValidation = (): void => {
    this.exampleValidation([this.operation.operationId]);
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

  //  TODO this should be replaced with genuin validation soon
  public exampleValidation(path: string[]): void {
    this.addMessage(Type.GenericSpectralWarning, path);
    this.addMessage(Type.GenericSpectralError, path);
  }

  // Run spectral test

  // Parse results

  // Map final results to new returned value
}

export default SpectralValidator;
