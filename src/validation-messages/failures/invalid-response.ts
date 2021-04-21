import ValidationFailure from './validation-failure';

class InvalidResponse extends ValidationFailure {
  constructor(path) {
    super('Response status code was a non 2XX value', path);
  }
}

export default InvalidResponse;
