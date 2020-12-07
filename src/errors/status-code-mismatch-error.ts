import {
  STATUS_CODE_MISMATCH_ERROR,
  STATUS_CODE_PREFIX,
} from '../utilities/constants';

class StatusCodeMismatchError extends TypeError {
  constructor(statusCode: number) {
    super(`${STATUS_CODE_MISMATCH_ERROR}. ${STATUS_CODE_PREFIX} ${statusCode}`);

    Object.setPrototypeOf(this, StatusCodeMismatchError.prototype);
  }
}

export default StatusCodeMismatchError;
