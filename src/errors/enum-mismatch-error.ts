import {
  ENUM_MISMATCH_ERROR,
  PATH_PREFIX,
  ENUM_PREFIX,
  ACTUAL_VALUE_PREFIX,
} from '../utilities/constants';
import { Json } from 'swagger-client';

class EnumMismatchError extends TypeError {
  constructor(path: string[], enumValues: Json[], actualValue: Json) {
    super(
      `${ENUM_MISMATCH_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${ENUM_PREFIX} ${JSON.stringify(
        enumValues,
      )}. ${ACTUAL_VALUE_PREFIX} ${JSON.stringify(actualValue)}`,
    );

    Object.setPrototypeOf(this, EnumMismatchError.prototype);
  }
}

export default EnumMismatchError;