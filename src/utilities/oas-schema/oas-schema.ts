import swaggerClient, { Response, Swagger } from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../oas-operation';
import ExampleGroup from '../example-group';
import {
  OASSecurityScheme,
  OASSecurityFactory,
  OASSecurity,
} from '../oas-security';

class OASSchema {
  private _client: Promise<Swagger>;

  private _swaggerOptions: Parameters<typeof swaggerClient>[0];

  private operations: OASOperation[];

  private topSecurities: OASSecurity[];

  private securitySchemes: OASSecurityScheme[];

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
    this._swaggerOptions = options;
    this.operations = [];
    this.topSecurities = [];
    this.securitySchemes = [];
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
  ): Promise<Response> => {
    const schema = await this._client;

    return schema
      .execute({
        operationId: operation.operationId,
        parameters: exampleGroup.examples,
      })
      .catch((error) => {
        return error.response;
      });
  };

  setAPISecurity = (apikey: string): void => {
    this._swaggerOptions = {
      authorizations: { apikey: { value: apikey } },
      ...this._swaggerOptions,
    };
    this._client = swaggerClient(this._swaggerOptions);
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

  getSecuritySchemes = async (): Promise<OASSecurityScheme[]> => {
    const schema = await this._client;
    if (this.securitySchemes.length === 0 && schema.spec.components) {
      this.securitySchemes = OASSecurityFactory.getSecuritySchemes(
        schema.spec.components.securitySchemes,
      );
    }
    return this.securitySchemes;
  };
}

export default OASSchema;
