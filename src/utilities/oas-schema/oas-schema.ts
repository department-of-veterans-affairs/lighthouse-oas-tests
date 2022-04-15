import swaggerClient, {
  ExecuteOptions,
  RequestBody,
  Response,
  Security,
  Swagger,
} from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../oas-operation';
import ExampleGroup from '../example-group';
import { OASSecurityScheme, OASSecurityFactory } from '../oas-security';
import OASServerFactory from '../oas-server/oas-server.factory';
import OASServer from '../oas-server/oas-server';

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
    requestBody: RequestBody,
    server: string | undefined,
  ): Promise<Response> => {
    const schema = await this._client;
    let options: ExecuteOptions = {
      operationId: operation.operationId,
      parameters: exampleGroup.examples,
      securities: {
        authorized: securities,
      },
    };

    if (Object.keys(requestBody).length > 0) {
      options = { requestBody, ...options };
    }

    if (server) {
      options = { server, ...options };
    }

    return schema.execute(options).catch((error) => {
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

  getServers = async (): Promise<OASServer[]> => {
    const schema = await this._client;
    return OASServerFactory.getServers(schema.spec.servers);
  };
}

export default OASSchema;
