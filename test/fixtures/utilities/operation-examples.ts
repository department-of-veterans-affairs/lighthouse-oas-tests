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
import { exampleRequestBodyEmpty } from './example-request-bodies';

export const operationExampleSimpleGetDefault = new OperationExample(
  operationSimpleGet,
  exampleGroupEmptyDefault,
  exampleRequestBodyEmpty,
);
export const operationExampleTomRiddleExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupTomRiddle,
  exampleRequestBodyEmpty,
);
export const operationExampleDefaultExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupDefault,
  exampleRequestBodyEmpty,
);
