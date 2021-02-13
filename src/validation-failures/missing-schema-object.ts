import {
  MISSING_SCHEMA_OBJECT_FAILURE,
  PATH_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class MissingSchemaObject extends ValidationFailure {
  constructor(path: string[]) {
    super(
      `${MISSING_SCHEMA_OBJECT_FAILURE}. ${PATH_PREFIX} ${path.join(' -> ')}`,
    );
  }
}

export default MissingSchemaObject;
