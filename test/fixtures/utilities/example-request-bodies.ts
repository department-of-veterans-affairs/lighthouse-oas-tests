import ExampleRequestBody from '../../../src/oas-parsing/request-body/example-request-body';
import {
  DEFAULT_REQUEST_BODY,
  NO_REQUEST_BODY,
  REQUIRED_FIELDS_REQUEST_BODY,
} from '../../../src/utilities/constants';

export const exampleRequestBodyEmpty = new ExampleRequestBody(
  NO_REQUEST_BODY,
  {},
);

export const exampleRequestBodyDefault = new ExampleRequestBody(
  DEFAULT_REQUEST_BODY,
  {
    age: 'eleventy one',
    home: 'The Shire',
    hobby: 'eating',
  },
);

export const exampleRequestBodyRequiredOnly = new ExampleRequestBody(
  REQUIRED_FIELDS_REQUEST_BODY,
  {
    age: 'eleventy one',
    home: 'The Shire',
  },
);
