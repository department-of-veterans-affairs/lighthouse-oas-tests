import { PATH_PREFIX } from '../utilities/constants';

class SchemaError extends TypeError {
  constructor(message: string, path: string[]) {
    super(`${message}. ${PATH_PREFIX} ${path.join(' -> ')}`);

    Object.setPrototypeOf(this, SchemaError.prototype);
  }
}

export default SchemaError;
