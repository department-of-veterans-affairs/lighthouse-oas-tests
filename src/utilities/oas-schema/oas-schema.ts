import swaggerClient, {
  Request,
  Response,
  Security,
  Swagger,
} from 'swagger-client';
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

  public get client(): Promise<Swagger> {
    return this._client;
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    securities: Security,
  ): Promise<{ request: Request; response: Response }> => {
    const schema = await this._client;
    let currentRequest;
    const response = await schema
      .execute({
        operationId: operation.operationId,
        parameters: exampleGroup.examples,
        securities: {
          authorized: securities,
        },
        requestInterceptor: (request) => {
          currentRequest = request;
          return request;
        },
      })
      .catch((error) => {
        return error.response;
      });
    return {
      request: currentRequest,
      response,
    };
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
