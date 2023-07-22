import ExampleRequestBody from '../../../src/oas-parsing/request-body/example-request-body';
import { NO_REQUEST_BODY } from '../../../src/utilities/constants';

export const emptyExampleRequestBody = new ExampleRequestBody(
  NO_REQUEST_BODY,
  {},
);
