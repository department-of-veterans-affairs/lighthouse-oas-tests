import ValidationFailure from './validation-failure';

class InvalidResponse extends ValidationFailure {
  constructor() {
    super('Response status code was a non 2XX value', []);
  }
}

export default InvalidResponse;
