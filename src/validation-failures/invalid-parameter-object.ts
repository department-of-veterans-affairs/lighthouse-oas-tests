import {
  INVALID_PARAMETER_OBJECT_FAILURE,
  PATH_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class InvalidParameterObject extends ValidationFailure {
  constructor(path: string[]) {
    super(
      `${INVALID_PARAMETER_OBJECT_FAILURE}. ${PATH_PREFIX} ${path.join(
        ' -> ',
      )}`,
    );
  }
}

export default InvalidParameterObject;
