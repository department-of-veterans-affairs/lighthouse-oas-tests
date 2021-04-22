import ValidationFailure from './validation-failure';

class StatusCodeMismatch extends ValidationFailure {
  constructor(statusCode: number) {
    super(
      `Response status code not present in schema. Actual status code: ${statusCode}`,
      [],
    );
  }
}

export default StatusCodeMismatch;
