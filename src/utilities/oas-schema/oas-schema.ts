import swaggerClient, { Response, Security, Swagger } from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../oas-operation';
import ExampleGroup from '../example-group';
import { OASSecurityScheme, OASSecurityFactory } from '../oas-security';

class OASSchema {
  private _client: Promise<Swagger>;

  private operations: OASOperation[];

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
    this.operations = [];
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    securities: Security,
  ): Promise<Response> => {
    const schema = await this._client;

    return schema
      .execute({
        operationId: operation.operationId,
        parameters: exampleGroup.examples,
        securities: {
          authorized: securities,
        },
      })
      .catch((error) => {
        return error.response;
      });
  };

  getOperations = async (): Promise<OASOperation[]> => {
    const schema = await this._client;
    if (this.operations.length === 0) {
      this.operations = OASOperationFactory.buildFromPaths(
        schema.spec.paths,
        schema.spec.security,
      );
    }
    return this.operations;
  };

  getSecuritySchemes = async (): Promise<OASSecurityScheme[]> => {
    const schema = await this._client;

    return OASSecurityFactory.getSecuritySchemes(
      schema.spec.components?.securitySchemes ?? {},
    );
  };
}

export default OASSchema;
