import { RequestBody } from 'swagger-client';

class ExampleRequestBody {
  readonly name: string;
  readonly requestBody: RequestBody;

  constructor(name: string, requestBody: RequestBody) {
    this.name = name;
    this.requestBody = requestBody;
  }
}

export default ExampleRequestBody;
