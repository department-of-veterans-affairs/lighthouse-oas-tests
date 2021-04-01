import { OperationObject, ParameterObject } from 'swagger-client';
import { ResponseObject } from 'swagger-client/schema';
import ExampleGroup, { ExampleGroupFactory } from '../example-group';

class OASOperation {
  readonly operationId: string;

  private _schema: OperationObject;

  private _exampleGroups: ExampleGroup[];

  readonly test: string[];

  constructor(schema: OperationObject) {
    this.test = [];
    this._schema = schema;
    this.operationId = schema.operationId;
    this._exampleGroups = ExampleGroupFactory.buildFromOperation(this);
  }

  get exampleGroups(): ExampleGroup[] {
    return [...this._exampleGroups];
  }

  get parameters(): ParameterObject[] {
    return this._schema.parameters;
  }

  get requiredParameterNames(): string[] {
    return this._schema.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);
  }

  getParameter(name): ParameterObject | null {
    const parameter = this.parameters.find(
      (parameter) => parameter.name === name,
    );
    return parameter ?? null;
  }

  getResponseSchema(statusCode: string | number): ResponseObject | null {
    const entry = this._schema.responses[statusCode];

    return entry ?? null;
  }
}

export default OASOperation;
