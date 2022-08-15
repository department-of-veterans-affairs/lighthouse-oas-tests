import swaggerClient, {
  ExecuteOptions,
  RequestBody,
  Response,
  SecurityValues,
  Swagger,
} from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../operation';
import ExampleGroup from '../example-group';
import { OASSecurityScheme, OASSecurityFactory } from '../security';
import OASServerFactory from '../server/oas-server.factory';
import OASServer from '../server/oas-server';
import { uniq } from 'lodash';

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
    securities: SecurityValues,
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
    if (this.operations.length === 0) {
      const schema = await this._client;
      this.operations = OASOperationFactory.buildFromPaths(
        schema.spec.paths,
        schema.spec.security,
      );
    }
    return this.operations;
  };

  getRelevantSecuritySchemes = async (): Promise<OASSecurityScheme[]> => {
    const operations = await this.getOperations();
    const uniqueSecurities = uniq(
      operations.flatMap((operation) => {
        return operation.security.map((security) => security.key);
      }),
    );

    if (uniqueSecurities.length === 0) {
      return [];
    }

    const schema = await this._client;
    const securitySchemes = OASSecurityFactory.getSecuritySchemes(
      schema.spec.components?.securitySchemes ?? {},
    );

    const missingSecuritySchemes: string[] = [];
    for (const security of uniqueSecurities) {
      if (
        securitySchemes.filter(
          (securityScheme) => securityScheme.key === security,
        ).length !== 1
      ) {
        missingSecuritySchemes.push(security);
      }
    }

    if (missingSecuritySchemes.length > 0) {
      throw new Error(
        `The following security requirements exist but no corresponding security scheme exists on the components object: ${missingSecuritySchemes.join(
          ', ',
        )}.
  See more at: https://swagger.io/specification/#security-requirement-object`,
      );
    }

    return securitySchemes.filter((scheme) =>
      uniqueSecurities.includes(scheme.key),
    );
  };

  getServers = async (): Promise<OASServer[]> => {
    const schema = await this._client;
    return OASServerFactory.getServers(schema.spec.servers);
  };
}

export default OASSchema;
