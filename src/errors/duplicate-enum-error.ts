import {
  DUPLICATE_ENUMS_ERROR,
  PATH_PREFIX,
  ENUM_PREFIX,
} from '../utilities/constants';
import { Json } from 'swagger-client';

class DuplicateEnumError extends TypeError {
  constructor(path: string[], enumValues: Json[]) {
    super(
      `${DUPLICATE_ENUMS_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${ENUM_PREFIX} ${JSON.stringify(enumValues)}`,
    );

    Object.setPrototypeOf(this, DuplicateEnumError.prototype);
  }
}

export default DuplicateEnumError;
