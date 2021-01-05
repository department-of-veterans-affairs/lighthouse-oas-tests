import { MISSING_REQUIRED_PARAMETER_ERROR } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class MissingRequiredParameters extends ValidationFailure {
  constructor(missingParams: string[]) {
    super(`${MISSING_REQUIRED_PARAMETER_ERROR} [${missingParams}]`);
  }
}

export default MissingRequiredParameters;
