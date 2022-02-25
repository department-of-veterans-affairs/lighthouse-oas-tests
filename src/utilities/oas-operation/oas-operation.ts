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
  readonly operationId: string;

  readonly parameters: ParameterObject[] | undefined;

  readonly requestBody: RequestBodyObject | undefined;

  readonly security: OASSecurity[];

  private _operation: OperationObject;

  private _exampleGroups: ExampleGroup[];

  private _exampleRequestBody: RequestBody;

  constructor(
    operation: OperationObject,
    securities: SecurityRequirementObject[] = [],
  ) {
    this._operation = operation;
    this.operationId = operation.operationId;
    this.parameters = operation.parameters;
    this.requestBody = operation.requestBody;
    this._exampleGroups = ExampleGroupFactory.buildFromOperation(this);
    this._exampleRequestBody = RequestBodyFactory.buildFromOperation(this);

    operation.security = operation.security ?? securities;
    this.security = OASSecurityFactory.getSecurities(operation.security);
  }

  get exampleGroups(): ExampleGroup[] {
    return [...this._exampleGroups];
  }

  get exampleRequestBody(): RequestBody {
    return { ...this._exampleRequestBody };
  }

  get requiredParameterNames(): string[] {
    if (this._operation.parameters === undefined) {
      return [];
    }

    return this._operation.parameters
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
    const entry = this._operation.responses[statusCode];

    return entry ?? null;
  }
}

export default OASOperation;
