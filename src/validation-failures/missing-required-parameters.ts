import ValidationFailure from './validation-failure';

class MissingRequiredParameters extends ValidationFailure {
  constructor(missingParams: string[]) {
    super(`Missing required parameters: [${missingParams}]`, []);
  }
}

export default MissingRequiredParameters;
