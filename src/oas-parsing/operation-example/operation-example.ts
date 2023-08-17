import { NO_REQUEST_BODY } from '../../utilities/constants';
import ExampleGroup from '../example-group/example-group';
import OASOperation from '../operation/oas-operation';
import ExampleRequestBody from '../request-body/example-request-body';

export default class OperationExample {
  readonly operation: OASOperation;

  readonly exampleGroup: ExampleGroup;

  readonly exampleRequestBody: ExampleRequestBody;

  readonly name: string;

  constructor(
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    exampleRequestBody: ExampleRequestBody,
  ) {
    this.operation = operation;
    this.exampleGroup = exampleGroup;
    this.exampleRequestBody = exampleRequestBody;

    this.name =
      exampleRequestBody.name === NO_REQUEST_BODY
        ? exampleGroup.name
        : `${exampleGroup.name} - ${exampleRequestBody.name}`;
  }
}
