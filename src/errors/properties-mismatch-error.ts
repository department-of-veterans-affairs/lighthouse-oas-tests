import {
  PROPERTIES_MISMATCH_ERROR,
  PATH_PREFIX,
  SCHEMA_PROPERTIES_PREFIX,
  ACTUAL_PROPERTIES_PREFIX,
} from '../utilities/constants';

class PropertiesMismatchError extends TypeError {
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

    Object.setPrototypeOf(this, PropertiesMismatchError.prototype);
  }
}

export default PropertiesMismatchError;
