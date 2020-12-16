import { MISSING_REQUIRED_PARAMETER_ERROR } from '../utilities/constants';

class MissingRequiredParametersError extends TypeError {
  constructor(missingParams: string[]) {
    super(`${MISSING_REQUIRED_PARAMETER_ERROR} [${missingParams}]`);

    Object.setPrototypeOf(this, MissingRequiredParametersError.prototype);
  }
}

export default MissingRequiredParametersError;
