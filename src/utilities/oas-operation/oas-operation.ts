import { OperationObject, ParameterObject, RequestBody } from 'swagger-client';
import {
  RequestBodyObject,
  ResponseObject,
  SecurityRequirementObject,
} from 'swagger-client/schema';
import ExampleGroup, { ExampleGroupFactory } from '../example-group';
import OASSecurity from '../oas-security';
import OASSecurityFactory from '../oas-security/oas-security.factory';
import RequestBodyFactory from '../request-body/request-body.factory';

class OASOperation {
  readonly operation: OperationObject;

  readonly operationId: string;

  readonly parameters: ParameterObject[] | undefined;

  readonly requestBody: RequestBodyObject | undefined;

  readonly security: OASSecurity[];

  private _exampleGroups: ExampleGroup[];

  private _exampleRequestBody: RequestBody;

  constructor(
    operation: OperationObject,
    securities: SecurityRequirementObject[] = [],
  ) {
    this.operation = operation;
    this.operationId = operation.operationId;
    this.parameters = operation.parameters;
    this.requestBody = operation.requestBody;
    this._exampleGroups = ExampleGroupFactory.buildFromOperation(this);
    this._exampleRequestBody = RequestBodyFactory.buildFromOperation(this);
    this.security = OASSecurityFactory.getSecurities(
      operation.security ?? securities,
    );
  }

  get exampleGroups(): ExampleGroup[] {
    return [...this._exampleGroups];
  }

  get exampleRequestBody(): RequestBody {
    return { ...this._exampleRequestBody };
  }

  get requiredParameterNames(): string[] {
    if (this.operation.parameters === undefined) {
      return [];
    }

    return this.operation.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);
  }

  getParameter(name): ParameterObject | null {
    if (this.parameters === undefined) {
      return null;
    }

    const parameter = this.parameters.find(
      (parameter) => parameter.name === name,
    );
    return parameter ?? null;
  }

  getResponseSchema(statusCode: string | number): ResponseObject | null {
    const entry = this.operation.responses[statusCode];

    return entry ?? null;
  }
}

export default OASOperation;
