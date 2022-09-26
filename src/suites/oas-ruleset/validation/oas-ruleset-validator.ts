import path from 'path';
import { BaseValidator, Message } from '../../../validation';
import OASSchema from '../../../oas-parsing/schema';
import OasRulesetMessage, { Type } from './oas-ruleset-message';
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

class OasRulesetValidator extends BaseValidator {
  private schema: OASSchema;
  public operationMap: Map<string, Map<string, MessageSet>>;

  constructor(schema: OASSchema) {
    super();
    this.schema = schema;
    this.operationMap = new Map();
  }

  // Spectral results are for the OAS as a whole and not specifically for an individual operation or rule
  //  To aid creating OpertaionResult[] going to store error/warning based on the two keys 'operation' & 'rule'
  public addMessage(
    operation: string,
    ruleName: string,
    type: Type,
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

    const message = new OasRulesetMessage(type, path, props);
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

  performValidation = async (): Promise<void> => {
    const rawResults = await this.runSpectral(this.schema);
    this.sanitizeResults(rawResults);
  };

  private async runSpectral(schema: OASSchema): Promise<SpectralResult[]> {
    const spectral = new Spectral();
    const rulesetFilepath = path.resolve(
      path.join(__dirname, './ruleset.yaml'),
    );
    spectral.setRuleset(await getRuleset(rulesetFilepath));

    return spectral.run(await schema.getRawSchema());
  }

  //  sanitizeResults() Need to classify results, determine operation, and clean the paths for messages
  private sanitizeResults(results: SpectralResult[]): void {
    for (const result of results) {
      const ruleName = result.code;
      let msgType = Type.OasRulesetError;

      if (result.severity === DiagnosticSeverity.Warning) {
        msgType = Type.OasRulesetWarning;
      }

      const { operation, cleanedPath } = this.extractDetailsFromPath(
        result.path as string[],
      );

      if (operation === `ROOT:GENERAL`) {
        // Indicates some manner of high level validation error
        msgType = Type.OasRulesetError;
      }

      this.addMessage(operation, `${ruleName}`, msgType, cleanedPath, [
        `${result.message}`,
      ]);
    }
  }

  private extractDetailsFromPath(path: string[]): {
    operation: string;
    cleanedPath: string[];
  } {
    let details = { operation: `ROOT:GENERAL`, cleanedPath: [] as string[] };

    if (!path || path.length === 0) {
      // Some major validation problems return no path.
      //  Example: openapi version cannot be determined
      return details;
    }

    if (path.length > 4 && path[0] === '_client') {
      // _client paths appear from major issues with document/validation
      //  and include unneeded details
      path.splice(0, 4);
    }

    if (path.length < 2) {
      // Root level property scenarios
      details = {
        operation: `ROOT:${path[0].toUpperCase()}`,
        cleanedPath: [] as string[],
      };
    } else {
      const operation = path[0].toUpperCase() + ':' + path[1].toUpperCase();
      path.shift();

      details = {
        operation: operation,
        cleanedPath: path,
      };
    }

    return details;
  }
}

export default OasRulesetValidator;
