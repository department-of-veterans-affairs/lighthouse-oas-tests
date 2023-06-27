import path from 'path';
import { BaseValidator, Message } from '../../../validation';
import OASSchema from '../../../oas-parsing/schema';
import OASOperation from '../../../oas-parsing/operation/oas-operation';
import RulesetMessage, { Type } from './ruleset-message';
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

enum operationEnum {
  openapidoc = 'ROOT:openapidoc',
  openapi = 'ROOT:openapi',
  info = 'ROOT:info',
  servers = 'ROOT:servers',
  security = 'ROOT:security',
  tags = 'ROOT:tags',
  paths = 'ROOT:paths',
  schemas = 'COMPONENTS:schemas',
  endpoint = 'ENDPOINT',
  property = 'PROPERTY',
}

// Assigning OOTB Spectral rules to operation groups to aid pass/warning/fail
//  stat tracking by notifying LOAST the types of checks being performed by group.
//  Should not need to be updated unless Spectral adds new core rules
const spectralRuleGroups: Record<string, operationEnum> = {
  'info-contact': operationEnum.info,
  'info-description': operationEnum.info,
  'no-eval-in-markdown': operationEnum.info,
  'no-script-tags-in-markdown': operationEnum.info,
  'oas3-api-servers': operationEnum.servers,
  'oas3-server-trailing-slash': operationEnum.servers,
  'typed-enum': operationEnum.property,
  'duplicated-entry-in-enum': operationEnum.property,
  'oas3-unused-component': operationEnum.schemas,
  'oas3-schema': operationEnum.property,
  'oas3-valid-schema-example': operationEnum.property,
  'path-keys-no-trailing-slash': operationEnum.paths,
  'path-declarations-must-exist': operationEnum.paths,
  'path-not-include-query': operationEnum.paths,
  'openapi-tags-uniqueness': operationEnum.tags,
  'operation-tags': operationEnum.endpoint,
  'operation-operationId': operationEnum.endpoint,
  'operation-description': operationEnum.endpoint,
  'operation-success-response': operationEnum.endpoint,
  'operation-operationId-unique': operationEnum.endpoint,
  'operation-parameters': operationEnum.endpoint,
  'operation-tag-defined': operationEnum.endpoint,
  'path-params': operationEnum.endpoint,
  'oas3-valid-media-example': operationEnum.endpoint,
  'oas3-operation-security-defined': operationEnum.endpoint,
  'oas3-examples-value-or-externalValue': operationEnum.endpoint,
};

class RulesetValidator extends BaseValidator {
  private schema: OASSchema;
  private rulesetfile: string;
  public operationMap: Map<string, Map<string, MessageSet>>;

  constructor(schema: OASSchema, rulesetName: string) {
    super();
    this.schema = schema;
    this.operationMap = new Map();
    this.rulesetfile = rulesetName + '.yaml';
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
    const message = new RulesetMessage(type, path, props);
    const ruleMap = this.registerRule(operation, ruleName);
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
    const rulesetFolder = path.resolve(__dirname, '..');
    const rulesetFilepath = path.resolve(
      path.join(rulesetFolder, this.rulesetfile),
    );

    spectral.setRuleset(await getRuleset(rulesetFilepath));

    if (spectral.ruleset) {
      const operations = await schema.getOperations();
      this.populateOperationMap(operations, spectral.ruleset.rules);
    }

    return spectral.run(await schema.getRawSchema());
  }

  // populateOperationMap() Setup operationMap before spectral runs
  //  based on if the rule was enabled in the ruleset and is included in stat tracking
  //  Needed since raw Spectral results exclude rules when there are no details reported
  //  Spectral does not include some checks in loaded ruleset such as the "no-$ref-siblings" rule
  private populateOperationMap(
    operations: OASOperation[],
    rules: Record<string, any>,
  ): void {
    Object.entries(rules).forEach(([ruleName, rule]) => {
      let operationGroup: operationEnum | undefined;

      if (rule.enabled) {
        // Custom rules are expected to follow a set pattern to assign their desired grouping
        //  'va-paths-one-required' rule will be assigned to 'paths' operationGroup
        const customRulePattern = /^va-(?<ruleOperation>\w+)-.*$/i;
        const customRuleMatch = customRulePattern.exec(ruleName);

        // Determine how to group rule
        if (customRuleMatch) {
          // Custom rule case: Using value from 'ruleOperation' regex group
          const ruleOperation = customRuleMatch.groups?.ruleOperation;

          if (ruleOperation) {
            operationGroup = operationEnum[ruleOperation.toLowerCase()];
          }
        } else if (spectralRuleGroups[ruleName]) {
          // Spectral rule case: Using already known value from spectralRuleGroups
          operationGroup = spectralRuleGroups[ruleName];
        }

        // Registering rules
        if (operationGroup) {
          if (
            operationGroup === operationEnum.endpoint ||
            operationGroup === operationEnum.property
          ) {
            // Rule applies to all OAS operations
            operations.forEach((operation) => {
              if (operation.operation.__originalOperationId) {
                this.registerRule(
                  operation.operation.__originalOperationId,
                  ruleName,
                );
              }
            });

            if (operationGroup === operationEnum.property) {
              // Custom 'property' rules applies to OAS operations & schemas
              this.registerRule(operationEnum.schemas, ruleName);
            }
          } else {
            this.registerRule(operationGroup, ruleName);
          }
        }
      }
    });
  }

  // registerRule() Registering the rule within LOAST
  private registerRule(
    operation: string,
    ruleName: string,
  ): Map<string, MessageSet> | undefined {
    if (!this.operationMap.has(operation)) {
      this.operationMap.set(operation, new Map());
    }

    const ruleMap = this.operationMap.get(operation);

    if (!ruleMap?.has(ruleName)) {
      ruleMap?.set(ruleName, { failures: new Map(), warnings: new Map() });
    }

    return ruleMap;
  }

  //  sanitizeResults() Need to classify results, determine operation, and clean the paths for messages
  private sanitizeResults(results: SpectralResult[]): void {
    for (const result of results) {
      const ruleName = result.code;
      let msgType = Type.RulesetError;

      if (result.severity === DiagnosticSeverity.Warning) {
        msgType = Type.RulesetWarning;
      }

      const { operation, cleanedPath } = this.extractDetailsFromPath(
        result.path as string[],
      );

      if (operation === operationEnum.openapidoc) {
        // Indicates some manner of high level validation error
        msgType = Type.RulesetError;
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
    let details = {
      operation: operationEnum.openapidoc as string,
      cleanedPath: [] as string[],
    };

    if (!path || path.length === 0) {
      // Some OpenAPIDoc validation problems return no path.
      //  Example: When openapi version cannot be determined
      return details;
    }

    if (path.length > 4 && path[0] === '_client') {
      // _client paths appear from major issues with document/validation
      //  and first four parts of path are not needed
      path.splice(0, 4);
    }

    if (path.length < 2) {
      // Root level scenario: info, tags, openapi, or paths
      details = {
        operation: `ROOT:${path[0]}`,
        cleanedPath: [] as string[],
      };
    } else {
      let operation = path[0].toUpperCase() + ':' + path[1];

      if (path[0].toUpperCase() === 'INFO') {
        // Nested info scenario: 'info' => <some property> => ...
        operation = operationEnum.info;
      }

      if (path[0].toUpperCase() === 'SERVERS') {
        // Nested servers scenario: 'servers' => <some property> => ...
        operation = operationEnum.servers;
      }

      if (path[0].toUpperCase() === 'TAGS') {
        // Nested tags scenario: 'tags' => [ <some property> ]
        operation = operationEnum.tags;
      }

      if (path[0].toUpperCase() === 'PATHS') {
        if (path.length >= 3) {
          // Endpoint scenario: 'paths' => '/apiPath' => 'get' => ...
          //  Removing 'paths' element
          path.splice(0, 1);
          operation = path[1].toUpperCase() + ':' + path[0];

          if (path.length > 5 && path[4] === 'content') {
            // Grouping media types togather to reduce duplicates
            path[5] = 'media_type';
          }
        } else {
          // High level path scenario: 'paths' => '/apiPath'
          operation = operationEnum.paths;
        }
      }

      // Remove first two parts of path since its included in operation
      path.splice(0, 2);

      details = {
        operation: operation,
        cleanedPath: path,
      };
    }

    return details;
  }
}

export default RulesetValidator;
