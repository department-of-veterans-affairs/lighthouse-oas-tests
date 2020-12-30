import {
  PROPERTIES_MISMATCH_ERROR,
  PATH_PREFIX,
  SCHEMA_PROPERTIES_PREFIX,
  ACTUAL_PROPERTIES_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class PropertiesMismatchError extends ValidationFailure {
  constructor(
    path: string[],
    schemaProperties: string[],
    actualProperties: string[],
  ) {
    super(
      `${PROPERTIES_MISMATCH_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${SCHEMA_PROPERTIES_PREFIX} ${schemaProperties.join(
        ', ',
      )}. ${ACTUAL_PROPERTIES_PREFIX} ${actualProperties.join(', ')}`,
    );
  }
}

export default PropertiesMismatchError;
