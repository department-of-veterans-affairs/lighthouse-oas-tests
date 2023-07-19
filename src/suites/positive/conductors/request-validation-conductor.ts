import ExampleGroup from '../../../oas-parsing/example-group';
import OASOperation from '../../../oas-parsing/operation';
import {
  ExampleGroupValidator,
  ParameterSchemaValidator,
  RequestBodyValidator,
} from '../validation';
import Message from '../../../validation/message';
import ExampleRequestBody from '../../../oas-parsing/request-body/example-request-body';

export default class RequestValidationConductor {
  private operation: OASOperation;

  private exampleGroup: ExampleGroup;

  private exampleRequestBody: ExampleRequestBody;

  constructor(
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    exampleRequestBody: ExampleRequestBody,
  ) {
    this.operation = operation;
    this.exampleGroup = exampleGroup;
    this.exampleRequestBody = exampleRequestBody;
  }

  async validate(): Promise<Map<string, Message>[]> {
    let failures: Map<string, Message> = new Map();
    let warnings: Map<string, Message> = new Map();

    const parameterSchemaValidator = new ParameterSchemaValidator(
      this.operation,
    );
    await parameterSchemaValidator.validate();
    failures = new Map([...failures, ...parameterSchemaValidator.failures]);
    warnings = new Map([...warnings, ...parameterSchemaValidator.warnings]);

    const requestBodyValidator = new RequestBodyValidator(
      this.operation,
      this.exampleRequestBody.requestBody,
    );
    await requestBodyValidator.validate();
    failures = new Map([...failures, ...requestBodyValidator.failures]);
    warnings = new Map([...warnings, ...requestBodyValidator.warnings]);

    const exampleGroupValidator = new ExampleGroupValidator(
      this.exampleGroup,
      this.operation,
    );
    await exampleGroupValidator.validate();
    failures = new Map([...failures, ...exampleGroupValidator.failures]);
    warnings = new Map([...warnings, ...exampleGroupValidator.warnings]);

    return [failures, warnings];
  }
}
