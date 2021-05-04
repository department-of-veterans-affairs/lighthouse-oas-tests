import swaggerClient, { Request, Response, Swagger } from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../oas-operation';
import ExampleGroup from '../example-group';
import {
  OASSecurityScheme,
  OASSecurityFactory,
  OASSecurity,
  OASSecurityType,
  OASIn,
} from '../oas-security';
import { Authorized } from 'swagger-client';

class OASSchema {
  private _client: Promise<Swagger>;

  private operations: OASOperation[];

  private topSecurities: OASSecurity[];

  private securitySchemes: Authorized;

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
    this.operations = [];
    this.topSecurities = [];
    this.securitySchemes = options.securities || { authorized: {} } as Authorized;
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  public get client(): Promise<Swagger> {
    return this._client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
  ): Promise<Response> => {
    const schema = await this._client;
    let securities;
    if (operation.security && operation.security.length > 0) {
      securities = {
        authorized: {},
      } as Authorized;
      operation.security.forEach((security) => {
        securities.authorized[security.key] = this.securitySchemes.authorized[
          security.key
        ];
      });
    }
    const response = schema
      .execute({
        operationId: operation.operationId,
        parameters: exampleGroup.examples,
        securities,
      })
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  getOperations = async (): Promise<OASOperation[]> => {
    const schema = await this._client;
    if (this.operations.length === 0) {
      this.operations = OASOperationFactory.buildFromPaths(schema.spec.paths);
    }
    return this.operations;
  };

  getTopSecurities = async (): Promise<OASSecurity[]> => {
    const schema = await this._client;
    if (this.topSecurities.length === 0 && schema.spec.security) {
      this.topSecurities = OASSecurityFactory.getSecurities(
        schema.spec.security,
      );
    }
    return this.topSecurities;
  };
}

export default OASSchema;
