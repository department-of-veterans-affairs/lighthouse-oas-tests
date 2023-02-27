import { RequestBody } from 'swagger-client';
import OASOperation from '../operation';

class RequestBodyFactory {
  static buildFromOperation(operation: OASOperation): RequestBody {
    const requestBodyExample = {};

    const requestBody = operation.requestBody;

    if (!requestBody || !requestBody.required) return {};

    const content = requestBody.content;
    // get first key in content map
    const [key] = Object.keys(content);
    const schema = content[key].schema;

    if (!schema) {
      return {};
    }

    const requiredProperties = schema.required;

    if (requiredProperties && schema.properties) {
      for (const requiredProperty of requiredProperties) {
        if (schema.properties[requiredProperty]) {
          const example = schema.properties[requiredProperty].example;
          requestBodyExample[requiredProperty] = example;
        }
      }
    }

    return requestBodyExample;
  }
}

export default RequestBodyFactory;
