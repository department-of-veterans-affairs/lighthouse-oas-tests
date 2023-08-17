import { OperationObject, ParameterObject } from 'swagger-client';
import {
  RequestBodyObject,
  ResponseObject,
  SecurityRequirementObject,
} from 'swagger-client/schema';
import ExampleGroup, { ExampleGroupFactory } from '../example-group';
import OASSecurity from '../security';
import OASSecurityFactory from '../security/oas-security.factory';
import RequestBodyFactory from '../request-body/request-body.factory';
import ExampleRequestBody from '../request-body/example-request-body';

class OASOperation {
  readonly operation: OperationObject;

  readonly operationId: string;

  readonly parameters: ParameterObject[] | undefined;

  readonly requestBody: RequestBodyObject | undefined;

  readonly security: OASSecurity[];

  private _exampleGroups: ExampleGroup[];

  private _exampleRequestBodies: ExampleRequestBody[];

  constructor(
    operation: OperationObject,
    securities: SecurityRequirementObject[] = [],
  ) {
    this.operation = operation;
    this.operationId = operation.operationId;
    this.parameters = operation.parameters;
    this.requestBody = operation.requestBody;
    this._exampleGroups = ExampleGroupFactory.buildFromOperation(this);
    this._exampleRequestBodies = RequestBodyFactory.buildFromOperation(this);
    this.security = OASSecurityFactory.getSecurities(
      operation.security ?? securities,
    );
  }

  get exampleGroups(): ExampleGroup[] {
    return [...this._exampleGroups];
  }

  get exampleRequestBodies(): ExampleRequestBody[] {
    return [...this._exampleRequestBodies];
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
