import swaggerClient, {
  Method,
  Response,
  SchemaObject,
  Swagger,
  Json,
} from 'swagger-client';
import { parse } from 'content-type';
import isEqual from 'lodash.isequal';
import uniqWith from 'lodash.uniqwith';
import uniq from 'lodash.uniq';

type ParameterExamples = { [name: string]: string };

type OasParameters = {
  [operationId: string]: ParameterExamples | ParameterExamples[];
};

type OasOperations = {
  [operationId: string]: Method;
};

class OasSchema {
  private _client: Promise<Swagger>;

  private operations: OasOperations = {};

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  execute = async (
    operationId: string,
    parameters: { [name: string]: string },
  ): Promise<Response> => {
    const schema = await this._client;

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
    const schema = await this._client;

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

      const exampleGroups: string[] = uniq(
        method.parameters
          .filter((parameter) => parameter.examples)
          .flatMap((parameter) => Object.keys(parameter.examples)),
      );

      let parameters: ParameterExamples | ParameterExamples[];

      // If example groups are present, create a parameter set for each one merged with the base parameters
      if (exampleGroups.length > 0) {
        parameters = exampleGroups.map((groupName) => {
          const groupParameters = method.parameters
            .filter(
              (parameter) =>
                parameter.examples && parameter.examples[groupName],
            )
            .map((parameter) => {
              const { name, examples } = parameter;
              return [name, examples[groupName]];
            });

          return Object.assign(
            {},
            Object.fromEntries(requiredParametersAndExamples),
            Object.fromEntries(groupParameters),
          );
        });
      } else {
        parameters = Object.fromEntries(requiredParametersAndExamples);
      }

      return [method.operationId, parameters];
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
    actual: Json,
    expected: SchemaObject,
  ): void {
    const enumValues = expected.enum;

    if (enumValues) {
      // check that expected enum does not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        throw new TypeError('Schema enum contains duplicate values');
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        throw new TypeError('Object does not match enum');
      }
    }

    // if the actual object is null check that null values are allowed
    if (actual === null) {
      if (expected.nullable) {
        return;
      }

      throw new TypeError(
        'Actual value was null. Schema should have nullable field set to true if null is allowed',
      );
    }

    const actualType = typeof actual;

    if (expected.type === 'array') {
      // check that the actual object is an array
      if (!Array.isArray(actual)) {
        throw new TypeError('Object type did not match schema');
      }

      // check that the expected object's items property is set
      const itemSchema = expected.items;
      if (!itemSchema) {
        throw new TypeError('Array schema missing items property');
      }

      // re-run for each item
      actual.forEach((item) => {
        this.validateObjectAgainstSchema(item, itemSchema);
      });
    } else {
      // check that type matches
      if (actualType !== expected.type) {
        throw new TypeError('Object type did not match schema');
      }

      // if type is object
      if (actualType === 'object') {
        // check that the expected object's properties field is set
        const properties = expected.properties;
        if (!properties) {
          throw new TypeError('Object schema is missing Properties');
        }

        const actualProperties = Object.keys(actual);
        const expectedProperties = Object.keys(properties);

        // check that the actual object only contains properties present in expected object
        if (
          actualProperties.filter(
            (property) => !expectedProperties.includes(property),
          ).length > 0
        ) {
          throw new TypeError(
            'Object contains a property not present in schema',
          );
        }

        // check required values are present
        expected.required?.forEach((requiredProperty) => {
          if (!actualProperties.includes(requiredProperty)) {
            throw new TypeError(
              `Object missing required property: ${requiredProperty}`,
            );
          }
        });

        // re-un for each property
        Object.entries(actual).forEach(([propertyName, propertyObject]) => {
          this.validateObjectAgainstSchema(
            propertyObject,
            properties[propertyName],
          );
        });
      }
    }
  }

  private getOperations = async (): Promise<OasOperations> => {
    const schema = await this._client;
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
