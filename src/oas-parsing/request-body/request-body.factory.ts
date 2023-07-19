import OASOperation from '../operation';
import ExampleRequestBody from './example-request-body';
import {
  DEFAULT_REQUEST_BODY,
  NO_REQUEST_BODY,
  REQUEST_BODY_REQUIRED_FIELDS_ONLY,
} from '../../utilities/constants';

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

    if (mediaTypeObjectExample) {
      // create default request body - example field as is
      const defaultRequestBody = new ExampleRequestBody(
        DEFAULT_REQUEST_BODY,
        mediaTypeObjectExample,
      );

      // create request body with only required fields if necessary
      if (schema) {
        const requiredProperties = schema.required;

        if (
          requiredProperties &&
          Object.keys(mediaTypeObjectExample).length > requiredProperties.length
        ) {
          const requiredPropertiesOnlyRequestBody = {};
          Object.entries(mediaTypeObjectExample).forEach(([key, value]) => {
            if (requiredProperties.includes(key)) {
              requiredPropertiesOnlyRequestBody[key] = value;
            }
          });

          const requiredPropertiesExampleRequestBody = new ExampleRequestBody(
            REQUEST_BODY_REQUIRED_FIELDS_ONLY,
            requiredPropertiesOnlyRequestBody,
          );

          return [defaultRequestBody, requiredPropertiesExampleRequestBody];
        }
      }

      return [defaultRequestBody];
    }

    // create default request body, including all schema properties that include an example
    const schemaProperties = schema.properties;

    if (schemaProperties) {
      const defaultRequestBody = {};
      Object.entries(schemaProperties).forEach(([key, value]) => {
        if (value.example) {
          defaultRequestBody[key] = value.example;
        }
      });

      const defaultExampleRequestBody = new ExampleRequestBody(
        DEFAULT_REQUEST_BODY,
        defaultRequestBody,
      );

      // create request body with only required fields if necessary
      const requiredProperties = schema.required;

      if (
        requiredProperties &&
        Object.keys(defaultRequestBody).length > requiredProperties.length
      ) {
        const requiredPropertiesOnlyRequestBody = {};
        Object.entries(defaultRequestBody).forEach(([key, value]) => {
          if (requiredProperties.includes(key)) {
            requiredPropertiesOnlyRequestBody[key] = value;
          }
        });

        const requiredPropertiesExampleRequestBody = new ExampleRequestBody(
          REQUEST_BODY_REQUIRED_FIELDS_ONLY,
          requiredPropertiesOnlyRequestBody,
        );

        return [
          defaultExampleRequestBody,
          requiredPropertiesExampleRequestBody,
        ];
      }

      return [defaultExampleRequestBody];
    }

    return [emptyRequestBody];
  }
}

export default RequestBodyFactory;
