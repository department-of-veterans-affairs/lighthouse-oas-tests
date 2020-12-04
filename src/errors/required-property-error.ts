import {
  MISSING_REQUIRED_PROPERTY_ERROR,
  PATH_PREFIX,
  REQUIRED_PROPERTY_PREFIX,
} from '../utilities/constants';

class RequiredPropertyError extends TypeError {
  constructor(path: string[], requiredProperty: string) {
    super(
      `${MISSING_REQUIRED_PROPERTY_ERROR}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}. ${REQUIRED_PROPERTY_PREFIX} ${requiredProperty}`,
    );

    Object.setPrototypeOf(this, RequiredPropertyError.prototype);
  }
}

export default RequiredPropertyError;
