import ValidationFailure from './validation-failure';

class InvalidRespone extends ValidationFailure {
  constructor(path) {
    super('Response status code was a non 2XX value', path);
  }
}

export default InvalidRespone;
