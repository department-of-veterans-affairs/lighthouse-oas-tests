import { Operation, ParameterObject } from 'swagger-client';
import { ResponseObject } from 'swagger-client/schema';
import ExampleGroup, { ExampleGroupFactory } from '../example-group';

class OASOperation {
  private operationId: string;

  private _schema: Operation;

  private exampleGroups: ExampleGroup[];

  constructor(schema: Operation) {
    this._schema = schema;
    this.operationId = schema.operationId;
    this.exampleGroups = ExampleGroupFactory.buildFromOperation(this);
  }

  getOperationId(): string {
    return this.operationId;
  }

  getExampleGroups(): ExampleGroup[] {
    return [...this.exampleGroups];
  }

  getRequiredParameterNames(): string[] {
    return this._schema.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);
  }

  getParameters(): ParameterObject[] {
    return this._schema.parameters;
  }

  getParameter(name): ParameterObject | null {
    const parameter = this.getParameters().find(
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
