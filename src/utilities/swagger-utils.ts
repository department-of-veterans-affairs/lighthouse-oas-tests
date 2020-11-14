import swaggerClient, { Response, Swagger } from 'swagger-client';

async function initializeSwaggerClient(
  swaggerClientOptions: Parameters<typeof swaggerClient>[0],
): Promise<Swagger> {
  return swaggerClient(swaggerClientOptions);
}

export async function execute(
  schema: Swagger,
  operationId: string,
  parameters: { [name: string]: string },
): Promise<Response> {
  return schema
    .execute({
      operationId,
      parameters,
    })
    .catch((error) => {
      return error.response;
    });
}

export default initializeSwaggerClient;
