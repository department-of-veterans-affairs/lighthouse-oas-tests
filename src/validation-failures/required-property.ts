import {
  MISSING_REQUIRED_PROPERTY_ERROR,
  PATH_PREFIX,
  REQUIRED_PROPERTY_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class RequiredProperty extends ValidationFailure {
  constructor(path: string[], requiredProperty: string) {
    super(
      `${MISSING_REQUIRED_PROPERTY_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${REQUIRED_PROPERTY_PREFIX} ${requiredProperty}`,
    );
  }
}

export default RequiredProperty;
