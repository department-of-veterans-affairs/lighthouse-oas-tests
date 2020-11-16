import swaggerClient, { Response, Swagger } from 'swagger-client';

type OasParameters = {
  [operationId: string]: { [name: string]: string };
};

class OasSchema {
  private client: Promise<Swagger>;

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this.client = swaggerClient(options);
  }

  execute = async (
    operationId: string,
    parameters: { [name: string]: string },
  ): Promise<Response> => {
    const schema = await this.client;

    return schema
      .execute({
        operationId,
        parameters,
      })
      .catch((error) => {
        return error.response;
      });
  };

  getParameters = async (): Promise<OasParameters> => {
    const schema = await this.client;
    return Object.fromEntries(
      Object.values(schema.spec.paths).flatMap((path) => {
        return Object.values(path).map((method) => {
          return [
            method.operationId,
            Object.fromEntries(
              method.parameters
                .filter((parameter) => parameter.required)
                .map((parameter) => {
                  const { name, example } = parameter;
                  return [name, example];
                }),
            ),
          ];
        });
      }),
    );
  };

  getOperationIds = async (): Promise<string[]> => {
    const schema = await this.client;
    return Object.values(schema.apis).flatMap((api) => {
      return Object.keys(api);
    });
  };
}

export default OasSchema;
