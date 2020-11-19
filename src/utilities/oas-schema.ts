import swaggerClient, {
  Method,
  Response,
  SchemaObject,
  Swagger,
} from 'swagger-client';
import { parse } from 'content-type';
import isEqual from 'lodash.isequal';
import uniqWith from 'lodash.uniqwith';

type OasParameters = {
  [operationId: string]: { [name: string]: string };
};

type OasOperations = {
  [operationId: string]: Method;
};

class OasSchema {
  private client: Promise<Swagger>;

  private operations: OasOperations = {};

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

  // Retrieves parameter name and example values for each operationId in the OAS.
  getParameters = async (): Promise<OasParameters> => {
    const schema = await this.client;

    const methods = Object.values(schema.spec.paths).flatMap((path) =>
      Object.values(path),
    );

    // transforms each OAS method into a tuple that contains the operation id and an object containing parameter names and example values
    // e.g. [ 'findFormByFormName', { form_name: 'VA10192' } ]
    const operationIdToParameters = methods.map((method) => {
      // transforms each OAS parameter into a tuple that contains the parameter name and example value
      // e.g. [form_name: 'VA10192']
      const requiredParametersAndExamples = method.parameters
        .filter((parameter) => parameter.required)
        .map((parameter) => {
          const { name, example } = parameter;
          return [name, example];
        });

      return [
        method.operationId,
        Object.fromEntries(requiredParametersAndExamples),
      ];
    });

    return Object.fromEntries(operationIdToParameters);
  };

  getOperationIds = async (): Promise<string[]> => {
    const operations = await this.getOperations();
    return Object.keys(operations);
  };

  validateResponse = async (
    operationId: string,
    response: Response,
  ): Promise<void> => {
    const operations = await this.getOperations();
    const operation = operations[operationId];

    if (
      !Object.keys(operation.responses)
        .map((statusCode) => parseInt(statusCode, 10))
        .includes(response.status)
    ) {
      throw new TypeError('Response status code not present in schema');
    }
    const contentType = parse(response.headers['content-type']).type;
    const contentTypeSchema =
      operation.responses[response.status].content[contentType];

    if (!contentTypeSchema) {
      throw new TypeError('Response content type not present in schema');
    }

    OasSchema.validateObjectAgainstSchema(
      response.body,
      contentTypeSchema.schema,
    );
  };

  public static validateObjectAgainstSchema(
    object: ReturnType<typeof JSON['parse']>,
    schema: SchemaObject,
  ): void {
    const enumValues = schema.enum;

    if (enumValues) {
      // check that schema enums do not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        throw new TypeError('Schema enum contains duplicate values');
      }

      // check that the object matches an element in the schema enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, object));
      if (filteredEnum.length === 0) {
        throw new TypeError('Object does not match enum');
      }
    }

    const objectType = typeof object;

    // check that type matches
    if (schema.type === 'array') {
      if (!Array.isArray(object)) {
        throw new TypeError('Object type did not match schema');
      }
      // re-run for each item
      const itemSchema = schema.items;
      if (!itemSchema) {
        throw new TypeError('Array schema missing items property');
      }

      object.forEach((item) => {
        this.validateObjectAgainstSchema(item, itemSchema);
      });
    } else {
      if (objectType !== schema.type) {
        throw new TypeError('Object type did not match schema');
      }
      // if type is object
      if (objectType === 'object') {
        const properties = schema.properties;
        if (!properties) {
          throw new TypeError('Object schema is missing Properties');
        }
        const objectProperties = Object.keys(object);
        const schemaProperties = Object.keys(properties);

        if (
          objectProperties.filter(
            (property) => !schemaProperties.includes(property),
          ).length > 0
        ) {
          throw new TypeError(
            'Object contains a property not present in schema',
          );
        }
        // check required values are present
        schema.required?.forEach((requiredProperty) => {
          if (!objectProperties.includes(requiredProperty)) {
            throw new TypeError(
              `Object missing required property: ${requiredProperty}`,
            );
          }
        });
        // re-un for each property
        Object.entries(object).forEach(([propertyName, propertyObject]) => {
          this.validateObjectAgainstSchema(
            propertyObject,
            properties[propertyName],
          );
        });
      }
    }
  }

  private getOperations = async (): Promise<OasOperations> => {
    const schema = await this.client;
    if (Object.keys(this.operations).length === 0) {
      this.operations = Object.fromEntries(
        Object.values(schema.spec.paths).flatMap((path) => {
          return Object.values(path).map((method) => {
            return [method.operationId, method];
          });
        }),
      );
    }
    return this.operations;
  };
}

export default OasSchema;
