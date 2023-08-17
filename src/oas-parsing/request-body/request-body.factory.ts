/**
 * The RequestBodyFactory class is responsible for creating ExampleRequestBodies for an OASOperation.
 * RequestBody OAS sources in order of precedence: MediaTypeObject.example => each MediaTypeObject.schema.properties "example" field
 */

import OASOperation from '../operation';
import ExampleRequestBody from './example-request-body';
import {
  DEFAULT_REQUEST_BODY,
  NO_REQUEST_BODY,
  REQUIRED_FIELDS_REQUEST_BODY,
} from '../../utilities/constants';
import { Json, SchemaObject } from 'swagger-client';

class RequestBodyFactory {
  /**
   * If the OASOperation does not require a request body or fields necessary to build a request body are missing, then only an empty ExampleRequestBody is returned.
   * The default ExampleRequestBody is built using the an OAS source in order of precedence:
   *   MediaTypeObject.example => each MediaTypeObject.schema.properties "example" field.
   * The default ExampleRequestBody is then used to build an additional ExampleRequestBody with only required fields, but if the required-fields-only
   * ExampleRequestBody is not necessary (i.e. the required-fields-only ExampleRequestBody is the same as the default ExampleRequestBody), then only the
   * default ExampleRequestBody is returned.
   * @param operation
   * @returns ExampleRequestBody[]
   */
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

  /**
   * Builds an ExampleRequestBody using the "example" field of each property present in the SchemaObject's "properties" field.
   * @param schema
   * @returns ExampleRequestBody | undefined
   */
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

  /**
   * Builds an ExampleRequestBody with only required fields, using a default requestBody as the source.
   * @param defaultExample
   * @param requiredProperties
   * @returns ExampleRequestBody | undefined
   */
  private static buildRequiredFieldsOnlyRequestBody(
    defaultExample: Json,
    requiredProperties: string[] | undefined,
  ): ExampleRequestBody | undefined {
    /**
     * Check if the defaultExample contains optional parameters by comparing the number of keys in the defaultExample to the number of requiredProperties.
     * If there are more keys in the defaultExample than requiredProperties, then the defaultExample must contain optional properties that can be filtered out, and
     * a required-properties-only request body can be built.
     * If there are the same number of keys in the defaultExample as requiredProperites, then the defaultExample must be the same as
     * the required-parameters-only, so undefined is returned.
     * If there are fewer keys in the defaultExample than requiredProperties, then a requiredProperty must be missing - no need to build a second
     * request body, and undefined is returned.
     */
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
