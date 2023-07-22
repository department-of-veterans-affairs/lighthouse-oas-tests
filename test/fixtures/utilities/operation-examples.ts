import { OperationExample } from '../../../src/oas-parsing/operation-example';
import {
  operationSimpleGet,
  operationGetWithExampleGroups,
} from './oas-operations';
import {
  exampleGroupDefault,
  exampleGroupEmptyDefault,
  exampleGroupTomRiddle,
} from './example-groups';
import { emptyExampleRequestBody } from './example-request-bodies';

export const operationExampleSimpleGetDefault = new OperationExample(
  operationSimpleGet,
  exampleGroupEmptyDefault,
  emptyExampleRequestBody,
);
export const operationExampleTomRiddleExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupTomRiddle,
  emptyExampleRequestBody,
);
export const operationExampleDefaultExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupDefault,
  emptyExampleRequestBody,
);
