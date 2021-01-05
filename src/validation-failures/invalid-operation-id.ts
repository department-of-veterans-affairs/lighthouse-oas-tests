import { INVALID_OPERATION_ID_ERROR } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class InvalidOperationId extends ValidationFailure {
  constructor(operationId: string) {
    super(`${INVALID_OPERATION_ID_ERROR} ${operationId}`);
  }
}

export default InvalidOperationId;
