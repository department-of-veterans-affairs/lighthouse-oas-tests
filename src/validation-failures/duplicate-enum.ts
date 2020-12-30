import {
  DUPLICATE_ENUMS_ERROR,
  PATH_PREFIX,
  ENUM_PREFIX,
} from '../utilities/constants';
import { Json } from 'swagger-client';
import ValidationFailure from './validation-failure';

class DuplicateEnumError extends ValidationFailure {
  constructor(path: string[], enumValues: Json[]) {
    super(
      `${DUPLICATE_ENUMS_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${ENUM_PREFIX} ${JSON.stringify(enumValues)}`,
    );
  }
}

export default DuplicateEnumError;
