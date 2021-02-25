import ValidationFailure from './validation-failure';

class InvalidOperationId extends ValidationFailure {
  constructor(operationId: string) {
    super(`Invalid operationId: ${operationId}`, []);
  }
}

export default InvalidOperationId;
