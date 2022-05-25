import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import {
  ExampleGroupValidator,
  ParameterSchemaValidator,
  RequestBodyValidator,
} from '../utilities/validators';
import { ValidationFailure } from '../validation-messages/failures';
import { ValidationWarning } from '../validation-messages/warnings';

export default class RequestValidationConductor {
  readonly operation: OASOperation;

  readonly exampleGroup: ExampleGroup;

  constructor(operation: OASOperation, exampleGroup: ExampleGroup) {
    this.operation = operation;
    this.exampleGroup = exampleGroup;
  }

  validate(): [Map<string, ValidationFailure>, Map<string, ValidationWarning>] {
    let failures: Map<string, ValidationFailure> = new Map();
    let warnings: Map<string, ValidationWarning> = new Map();

    const parameterSchemaValidator = new ParameterSchemaValidator(
      this.operation,
    );
    parameterSchemaValidator.validate();
    failures = new Map([...failures, ...parameterSchemaValidator.failures]);
    warnings = new Map([...warnings, ...parameterSchemaValidator.warnings]);

    const requestBodyValidator = new RequestBodyValidator(this.operation);
    requestBodyValidator.validate();
    failures = new Map([...failures, ...requestBodyValidator.failures]);
    warnings = new Map([...warnings, ...requestBodyValidator.warnings]);

    const exampleGroupValidator = new ExampleGroupValidator(
      this.exampleGroup,
      this.operation,
    );
    exampleGroupValidator.validate();
    failures = new Map([...failures, ...exampleGroupValidator.failures]);
    warnings = new Map([...warnings, ...exampleGroupValidator.warnings]);

    return [failures, warnings];
  }
}
