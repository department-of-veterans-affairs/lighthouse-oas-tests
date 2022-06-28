import { OperationExampleResult } from '../results';
import RequestValidationConductor from './request-validation-conductor';
import OASOperation from '../utilities/oas-operation';
import ExampleGroup from '../utilities/example-group';
import OASSchema from '../utilities/oas-schema';
import { RequestBody, SecurityValues } from 'swagger-client';
import ResponseValidationConductor from './response-validation-conductor';
import { OperationExample } from '../utilities/operation-example';

export default class ValidationConductor {
  private schema: OASSchema;

  private operation: OASOperation;

  private exampleGroup: ExampleGroup;

  private requestBody: RequestBody;

  private securityValues: SecurityValues;

  private server: string | undefined;

  constructor(
    schema: OASSchema,
    { operation, exampleGroup, requestBody }: OperationExample,
    securityValues: SecurityValues,
    server: string | undefined,
  ) {
    this.schema = schema;
    this.operation = operation;
    this.exampleGroup = exampleGroup;
    this.requestBody = requestBody;
    this.securityValues = securityValues;
    this.server = server;
  }

  async validate(): Promise<OperationExampleResult> {
    const requestValidationConductor = new RequestValidationConductor(
      this.operation,
      this.exampleGroup,
    );

    let [failures, warnings] = requestValidationConductor.validate();

    if (failures.size === 0) {
      const response = await this.schema.execute(
        this.operation,
        this.exampleGroup,
        this.securityValues,
        this.requestBody,
        this.server,
      );

      const responseValidationConductor = new ResponseValidationConductor(
        response,
        this.operation,
      );

      const [responseValidationFailures, responseValidationWarnings] =
        responseValidationConductor.validate();

      failures = new Map([...failures, ...responseValidationFailures]);
      warnings = new Map([...warnings, ...responseValidationWarnings]);
    }

    // get the original operation ID
    const originalOperationId = this.operation.operation.__originalOperationId;

    return new OperationExampleResult(
      this.operation.operationId,
      originalOperationId,
      this.exampleGroup.name,
      failures,
      warnings,
    );
  }
}
