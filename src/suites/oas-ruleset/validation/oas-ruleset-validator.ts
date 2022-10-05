import path from 'path';
import { BaseValidator, Message } from '../../../validation';
import OASSchema from '../../../oas-parsing/schema';
import OASOperation from '../../../oas-parsing/operation/oas-operation';
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

enum operationEnum {
  openapidoc = 'ROOT:openapidoc',
  openapi = 'ROOT:openapi',
  info = 'ROOT:info',
  servers = 'ROOT:servers',
  security = 'ROOT:security',
  tags = 'ROOT:tags',
  paths = 'ROOT:paths',
  schemas = 'COMPONENTS:schemas',
}

// sharedRules & endpointRuleOperations intended to aid pass/warning/fail
//  stat tracking by notifying LOAST the types of checks being performed.
//  This should be updated as new rules are added/removed
const sharedRules: Record<string, string> = {
  'va-openapi-supported-versions': operationEnum.openapi,
  'info-contact': operationEnum.info,
  'info-description': operationEnum.info,
  'no-eval-in-markdown': operationEnum.info,
  'no-script-tags-in-markdown': operationEnum.info,
  'va-info-description-minimum-length': operationEnum.info,
  'oas3-api-servers': operationEnum.servers,
  'oas3-server-trailing-slash': operationEnum.servers,
  'typed-enum': operationEnum.schemas,
  'duplicated-entry-in-enum': operationEnum.schemas,
  'oas3-unused-component': operationEnum.schemas,
  'oas3-schema': operationEnum.schemas,
  'oas3-valid-schema-example': operationEnum.schemas,
  'path-keys-no-trailing-slash': operationEnum.paths,
  'path-declarations-must-exist': operationEnum.paths,
  'path-not-include-query': operationEnum.paths,
  'va-one-path-required': operationEnum.paths,
  'va-one-operation-required': operationEnum.paths,
  'openapi-tags-uniqueness': operationEnum.tags,
};

const endpointRules = [
  'typed-enum',
  'operation-tags',
  'operation-operationId',
  'operation-description',
  'operation-success-response',
  'operation-operationId-unique',
  'operation-parameters',
  'operation-tag-defined',
  'duplicated-entry-in-enum',
  'path-params',
  'oas3-schema',
  'oas3-valid-schema-example',
  'oas3-valid-media-example',
  'oas3-operation-security-defined',
  'oas3-examples-value-or-externalValue',
  'va-endpoint-summary-required',
  'va-endpoint-summary-minimum-length',
  'va-endpoint-description-minimum-length',
  'va-param-description-required',
  'va-param-example-required',
  'va-request-content-supported-mediatypes',
  'va-response-content-supported-mediatypes',
];

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
    const message = new OasRulesetMessage(type, path, props);
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
    const rulesetFilepath = path.resolve(
      path.join(__dirname, './ruleset.yaml'),
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
  //  Spectral does not include some checks in loaded ruleset such as the "no-$ref-siblings" rule
  private populateOperationMap(
    operations: OASOperation[],
    rules: Record<string, any>,
  ): void {
    Object.entries(rules).forEach(([ruleName, rule]) => {
      if (rule.enabled) {
        // Populating shared rules
        if (sharedRules[ruleName]) {
          this.registerRule(sharedRules[ruleName], ruleName);
        }

        // Populating endpoint level rules
        if (endpointRules.includes(ruleName)) {
          operations.forEach((operation) => {
            if (operation.operation.__originalOperationId) {
              this.registerRule(
                operation.operation.__originalOperationId,
                ruleName,
              );
            }
          });
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
      let msgType = Type.OasRulesetError;

      if (result.severity === DiagnosticSeverity.Warning) {
        msgType = Type.OasRulesetWarning;
      }

      const { operation, cleanedPath } = this.extractDetailsFromPath(
        result.path as string[],
      );

      if (operation === operationEnum.openapidoc) {
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

export default OasRulesetValidator;
