import { INVALID_OPERATION_ID_ERROR } from '../utilities/constants';

class InvalidOperationIdError extends TypeError {
  constructor(operationId: string) {
    super(`${INVALID_OPERATION_ID_ERROR} ${operationId}`);

    Object.setPrototypeOf(this, InvalidOperationIdError.prototype);
  }
}

export default InvalidOperationIdError;
