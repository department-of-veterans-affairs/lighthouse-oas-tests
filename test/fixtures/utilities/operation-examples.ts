import { OperationExample } from '../../../src/utilities/operation-example';
import ExampleGroup from '../../../src/utilities/example-group';
import {
  harryPotterOperation,
  heWhoMustNotBeNamedOperation,
} from './oas-operations';
import {
  defaultExampleGroup,
  emptyDefaultExampleGroup,
  tomRiddleExampleGroup,
} from './example-groups';

export const harryPotterDefaultOperationExample = new OperationExample(
  'GET:/harryPotter:default',
  harryPotterOperation,
  emptyDefaultExampleGroup,
  {},
);
export const heWhoMustNotBeNamedTomRiddleOperationExample =
  new OperationExample(
    'GET:/he-who-must-not-be-named:tomRiddle',
    heWhoMustNotBeNamedOperation,
    tomRiddleExampleGroup,
    {},
  );
export const heWhoMustNotBeNamedDefaultOperationExample = new OperationExample(
  'GET:/he-who-must-not-be-named:default',
  heWhoMustNotBeNamedOperation,
  defaultExampleGroup,
  {},
);
