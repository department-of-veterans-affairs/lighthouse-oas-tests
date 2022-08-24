import path from 'path';
import { BaseValidator, Message } from '../../../validation';
import OASSchema from '../../../oas-parsing/schema';
import SpectralMessage, { Type } from './spectral-message';
import {
  Spectral,
  ISpectralDiagnostic as SpectralResult,
} from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import { getRuleset } from './ruleset-wrapper';

declare type MessageSet = {
  failures: Map<string, Message>;
  warnings: Map<string, Message>;
};

class SpectralValidator extends BaseValidator {
  private schema: OASSchema;
  public operationMap: Map<string, Map<string, MessageSet>>;

  constructor(schema: OASSchema) {
    super();
    this.schema = schema;
    this.operationMap = new Map();
  }

  // Spectral results are for the OAS as a whole and not specifically for an individual operation or rule
  //  To aid creating OpertaionResult[] method stores error/warning based on the two keys 'operation' & 'rule'
  public addMessage(
    operation: string,
    ruleName: string,
    type: unknown,
    path: string[],
    props?: string[],
  ): void {
    if (!this.operationMap.has(operation)) {
      this.operationMap.set(operation, new Map());
    }

    const ruleMap = this.operationMap.get(operation);

    if (!ruleMap?.has(ruleName)) {
      ruleMap?.set(ruleName, { failures: new Map(), warnings: new Map() });
    }

    const message = new SpectralMessage(type, path, props);
    const messageSet = ruleMap?.get(ruleName);

    if (messageSet) {
      const map = message.isError() ? messageSet.failures : messageSet.warnings;
      const existingMessage = map.get(message.hash);

      if (existingMessage) {
        existingMessage.incrementCount();
      } else {
        map.set(message.hash, message);
      }
    }
  }

  performValidation = (): void => {};

  public async getOperationResults(): Promise<void> {
    const rawResults = await this.runSpectral(this.schema);
    this.sanitizeResults(rawResults);
  }

  private async runSpectral(schema: any): Promise<SpectralResult[]> {
    const spectral = new Spectral();
    const rulesetFilepath = path.resolve(
      path.join(__dirname, '../../../../spectral.yaml'), // TODO lets avoid this approach
    );
    spectral.setRuleset(await getRuleset(rulesetFilepath));

    return spectral.run(schema);
  }

  // Spectral results are for the OAS as a whole and not specifically for a operation or rule
  //  Need to prepare the message to include information to create OperationResult[] down the road
  //  Unneeded information also needs to be removed
  private sanitizeResults(results: SpectralResult[]): void {
    for (const result of results) {
      const ruleName = result.code;
      let msgType = Type.SpectralError;

      if (result.severity === DiagnosticSeverity.Warning) {
        msgType = Type.SpectralWarning;
      }

      const newPath = this.sanitizePath(result.path as string[]);

      // Get operation string (example: /path:GET)
      let operation = newPath[0];
      if (newPath.length > 2) {
        operation = newPath[0] + ':' + newPath[1].toUpperCase();
      }

      this.addMessage(operation, `${ruleName}`, msgType, newPath, [
        `${result.message}`,
      ]);
    }
  }

  // sanitizePath() Removes unneeded details provided by Spectral
  private sanitizePath(path: string[]): string[] {
    if (path.length > 4 && path[0] === '_client') {
      path.splice(0, 4);
    }

    return path;
  }
}

export default SpectralValidator;
