import OASOperation from '../operation';
import ExampleRequestBody from './example-request-body';
import {
  DEFAULT_REQUEST_BODY,
  NO_REQUEST_BODY,
  REQUIRED_FIELDS_REQUEST_BODY,
} from '../../utilities/constants';
import { Json, SchemaObject } from 'swagger-client';

class RequestBodyFactory {
  static buildFromOperation(operation: OASOperation): ExampleRequestBody[] {
    const requestBody = operation.requestBody;
    const emptyRequestBody = new ExampleRequestBody(NO_REQUEST_BODY, {});

    if (!requestBody || !requestBody.required) return [emptyRequestBody];

    const content = requestBody.content;
    // get first key in content map
    const [key] = Object.keys(content);
    const mediaTypeObject = content[key];
    const schema = mediaTypeObject.schema;
    const mediaTypeObjectExample = mediaTypeObject.example;

    let defaultRequestBody: ExampleRequestBody | undefined = undefined;

    if (mediaTypeObjectExample) {
      // create default request body - example field as is
      defaultRequestBody = new ExampleRequestBody(
        DEFAULT_REQUEST_BODY,
        mediaTypeObjectExample,
      );
    } else if (schema) {
      // create default request body from schema
      defaultRequestBody = this.buildFromSchemaExamples(schema);
    }

    // create request body with only required fields if necessary
    if (defaultRequestBody !== undefined) {
      const requiredFieldsRequestBody = this.buildRequiredFieldsOnlyRequestBody(
        defaultRequestBody.requestBody,
        schema.required,
      );

      if (requiredFieldsRequestBody !== undefined) {
        return [defaultRequestBody, requiredFieldsRequestBody];
      }

      return [defaultRequestBody];
    }

    return [emptyRequestBody];
  }

  private static buildFromSchemaExamples(
    schema: SchemaObject,
  ): ExampleRequestBody | undefined {
    const schemaProperties = schema.properties;

    if (schemaProperties) {
      const requestBody = {};
      Object.entries(schemaProperties).forEach(([key, value]) => {
        if (value.example) {
          requestBody[key] = value.example;
        }
      });

      const exampleRequestBody = new ExampleRequestBody(
        DEFAULT_REQUEST_BODY,
        requestBody,
      );

      return exampleRequestBody;
    }

    return undefined;
  }

  private static buildRequiredFieldsOnlyRequestBody(
    defaultExample: Json,
    requiredProperties: string[] | undefined,
  ): ExampleRequestBody | undefined {
    if (
      requiredProperties &&
      Object.keys(defaultExample).length > requiredProperties.length
    ) {
      const requiredPropertiesOnlyRequestBody = {};
      Object.entries(defaultExample).forEach(([key, value]) => {
        if (requiredProperties.includes(key)) {
          requiredPropertiesOnlyRequestBody[key] = value;
        }
      });

      const requiredPropertiesExampleRequestBody = new ExampleRequestBody(
        REQUIRED_FIELDS_REQUEST_BODY,
        requiredPropertiesOnlyRequestBody,
      );

      return requiredPropertiesExampleRequestBody;
    }

    return undefined;
  }
}

export default RequestBodyFactory;
