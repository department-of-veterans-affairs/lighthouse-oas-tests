import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';

export interface OperationExample {
  id: string;
  operation: OASOperation;
  exampleGroup: ExampleGroup;
}

export interface OASConfig {
  path: string;
  apiKey: string;
  bearerToken: string;
  server: string;
}
