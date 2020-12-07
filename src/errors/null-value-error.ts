import { NULL_VALUE_ERROR, PATH_PREFIX } from '../utilities/constants';

class NullValueError extends TypeError {
  constructor(path: string[]) {
    super(`${NULL_VALUE_ERROR}. ${PATH_PREFIX} ${path.join(' -> ')}`);

    Object.setPrototypeOf(this, NullValueError.prototype);
  }
}

export default NullValueError;
