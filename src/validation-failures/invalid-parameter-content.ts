import {
  INVALID_PARAMETER_CONTENT_FAILURE,
  PATH_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class InvalidParameterContent extends ValidationFailure {
  constructor(path: string[]) {
    super(
      `${INVALID_PARAMETER_CONTENT_FAILURE}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}`,
    );
  }
}

export default InvalidParameterContent;
