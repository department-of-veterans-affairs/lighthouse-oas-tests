import { NULL_VALUE_ERROR, PATH_PREFIX } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class NullValueNotAllowed extends ValidationFailure {
  constructor(path: string[]) {
    super(`${NULL_VALUE_ERROR}. ${PATH_PREFIX} ${path.join(' -> ')}`);
  }
}

export default NullValueNotAllowed;
