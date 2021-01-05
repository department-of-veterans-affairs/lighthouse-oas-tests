import {
  STATUS_CODE_MISMATCH_ERROR,
  STATUS_CODE_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class StatusCodeMismatch extends ValidationFailure {
  constructor(statusCode: number) {
    super(`${STATUS_CODE_MISMATCH_ERROR}. ${STATUS_CODE_PREFIX} ${statusCode}`);
  }
}

export default StatusCodeMismatch;
