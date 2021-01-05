import { PATH_PREFIX } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class Schema extends ValidationFailure {
  constructor(message: string, path: string[]) {
    super(`${message}. ${PATH_PREFIX} ${path.join(' -> ')}`);
  }
}

export default Schema;
