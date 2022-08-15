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

export const operationExampleSimpleGetDefault = new OperationExample(
  operationSimpleGet,
  exampleGroupEmptyDefault,
  {},
);
export const operationExampleTomRiddleExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupTomRiddle,
  {},
);
export const operationExampleDefaultExGroup = new OperationExample(
  operationGetWithExampleGroups,
  exampleGroupDefault,
  {},
);
