import { INVALID_OPERATION_ID_ERROR } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class InvalidOperationIdError extends ValidationFailure {
  constructor(operationId: string) {
    super(`${INVALID_OPERATION_ID_ERROR} ${operationId}`);
  }
}

export default InvalidOperationIdError;
