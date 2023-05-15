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
  private _client?: Swagger;
  private clientOptions: Parameters<typeof swaggerClient>[0];
  private operations: OASOperation[];
  private url: string | undefined;
  private rawSpec: any;

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this.url = options.url;
    if (options.spec) {
      // store a deep clone before client adds its own normalization and reference handling
      this.rawSpec = JSON.parse(JSON.stringify(options.spec));
    }

    this.clientOptions = options;
    this.operations = [];
  }

  public set client(client: Swagger) {
    this._client = client;
  }

  private async getClient(): Promise<Swagger> {
    if (!this._client) {
      this._client = await swaggerClient(this.clientOptions);
    }
    return this._client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    securities: SecurityValues,
    requestBody: RequestBody,
    server: string | undefined,
  ): Promise<Response> => {
    const schema = await this.getClient();
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

    // if the example group contains an Accept header parameter,
    // copy that over to responseContentType so it gets added to the header by the swagger client
    if (
      options.parameters?.Accept !== undefined && // an inexpensive initial test
      operation.parameters?.find(
        (parameter) => parameter.name === 'Accept' && parameter.in === 'header',
      ) !== undefined
    ) {
      options.responseContentType = options.parameters.Accept;
    }

    return schema.execute(options).catch((error) => {
      return error.response;
    });
  };

  getOperations = async (): Promise<OASOperation[]> => {
    if (this.operations.length === 0) {
      const schema = await this.getClient();
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

    const schema = await this.getClient();
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
    const schema = await this.getClient();
    return OASServerFactory.getServers(schema.spec.servers);
  };

  getRawSchema = async (): Promise<any> => {
    if (!this.rawSpec && this.url) {
      // Attempting to get raw spec from URL if not already available
      const spec = await fetch(this.url).then((res) => {
        if (!res.ok) {
          throw new Error('Unable to get OASSchema from URL');
        }

        return res.text();
      });

      this.rawSpec = spec;
    }

    return this.rawSpec;
  };
}

export default OASSchema;
