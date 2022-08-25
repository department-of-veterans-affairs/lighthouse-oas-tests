import ExampleGroup from '../../../oas-parsing/example-group';
import OASOperation from '../../../oas-parsing/operation';
import {
  ExampleGroupValidator,
  ParameterSchemaValidator,
  RequestBodyValidator,
} from '../validation';
import Message from '../../../validation/message';

export default class RequestValidationConductor {
  private operation: OASOperation;

  private exampleGroup: ExampleGroup;

  constructor(operation: OASOperation, exampleGroup: ExampleGroup) {
    this.operation = operation;
    this.exampleGroup = exampleGroup;
  }

  validate(): Map<string, Message>[] {
    let failures: Map<string, Message> = new Map();
    let warnings: Map<string, Message> = new Map();

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
