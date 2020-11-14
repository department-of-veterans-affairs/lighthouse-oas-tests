import { Swagger } from 'swagger-client';

function getParameters(
  schema: Swagger,
): {
  [operationId: string]: { [name: string]: string };
} {
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
}

export default getParameters;
