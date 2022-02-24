import OASOperation from '../oas-operation';
import { RequestBody } from './types';

class RequestBodyFactory {
  static buildFromOperation(operation: OASOperation): RequestBody {
    const requestBodyExample = {};

    const requestBody = operation.requestBody;

    if (!requestBody || !requestBody.required) return {};

    const content = requestBody.content;
    // get first key in content map
    const [key] = Object.keys(content);
    const schema = content[key].schema;

    const requiredProperties = schema.required;

    if (requiredProperties && schema.properties) {
      for (const requiredProperty of requiredProperties) {
        const example = schema.properties[requiredProperty].example;
        requestBodyExample[requiredProperty] = example;
      }
    }

    return requestBodyExample;
  }
}

export default RequestBodyFactory;
