import ExampleGroup from '../../../src/oas-parsing/example-group/example-group';
import {
  OperationExample,
  OperationExampleFactory,
} from '../../../src/oas-parsing/operation-example';
import {
  exampleRequestBodyDefault,
  exampleRequestBodyRequiredOnly,
} from '../../fixtures/utilities/example-request-bodies';
import {
  operationSimpleGet,
  operationGetWithExampleGroups,
  operationWithExampleGroupsAndExampleRequestBodies,
} from '../../fixtures/utilities/oas-operations';
import {
  operationExampleSimpleGetDefault,
  operationExampleDefaultExGroup,
  operationExampleTomRiddleExGroup,
} from '../../fixtures/utilities/operation-examples';

describe('OperationExampleFactory', () => {
  describe('buildFromOperations', () => {
    it('returns the expected OperationExamples', () => {
      const exampleGroupFrodo = new ExampleGroup('frodo', {
        name: 'frodo',
      });

      const exampleGroupBilboDefault = new ExampleGroup('default', {
        name: 'bilbo',
      });

      const operationExampleFrodoExGroupDefaultRequestBody =
        new OperationExample(
          operationWithExampleGroupsAndExampleRequestBodies,
          exampleGroupFrodo,
          exampleRequestBodyDefault,
        );

      const operationExampleFrodoExGroupRequiredOnlyRequestBody =
        new OperationExample(
          operationWithExampleGroupsAndExampleRequestBodies,
          exampleGroupFrodo,
          exampleRequestBodyRequiredOnly,
        );

      const operationExampleDefaultExGroupDefaultRequestBody =
        new OperationExample(
          operationWithExampleGroupsAndExampleRequestBodies,
          exampleGroupBilboDefault,
          exampleRequestBodyDefault,
        );

      const operationExampleDefaultExGroupRequiredOnlyRequestBody =
        new OperationExample(
          operationWithExampleGroupsAndExampleRequestBodies,
          exampleGroupBilboDefault,
          exampleRequestBodyRequiredOnly,
        );

      const operationExamples = OperationExampleFactory.buildFromOperations([
        operationSimpleGet,
        operationGetWithExampleGroups,
        operationWithExampleGroupsAndExampleRequestBodies,
      ]);
      expect(operationExamples).toHaveLength(7);
      expect(operationExamples).toContainEqual(
        operationExampleSimpleGetDefault,
      );
      expect(operationExamples).toContainEqual(operationExampleDefaultExGroup);
      expect(operationExamples).toContainEqual(
        operationExampleTomRiddleExGroup,
      );
      expect(operationExamples).toContainEqual(
        operationExampleFrodoExGroupDefaultRequestBody,
      );
      expect(operationExamples).toContainEqual(
        operationExampleFrodoExGroupRequiredOnlyRequestBody,
      );
      expect(operationExamples).toContainEqual(
        operationExampleDefaultExGroupDefaultRequestBody,
      );
      expect(operationExamples).toContainEqual(
        operationExampleDefaultExGroupRequiredOnlyRequestBody,
      );
    });
  });
});
