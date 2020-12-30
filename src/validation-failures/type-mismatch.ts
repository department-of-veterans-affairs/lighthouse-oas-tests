import {
  TYPE_MISMATCH_ERROR,
  PATH_PREFIX,
  SCHEMA_TYPE_PREFIX,
  ACTUAL_TYPE_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class TypeMismatchError extends ValidationFailure {
  constructor(path: string[], schemaType: string, actualType: string) {
    super(
      `${TYPE_MISMATCH_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${SCHEMA_TYPE_PREFIX} ${schemaType}. ${ACTUAL_TYPE_PREFIX} ${actualType}`,
    );

    Object.setPrototypeOf(this, TypeMismatchError.prototype);
  }
}

export default TypeMismatchError;
