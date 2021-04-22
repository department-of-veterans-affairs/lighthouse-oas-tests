import ValidationFailure from './validation-failure';

class NullValueNotAllowed extends ValidationFailure {
  constructor(path: string[]) {
    super('Actual value is null but schema does not allow null values.', path);
  }
}

export default NullValueNotAllowed;
