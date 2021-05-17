import ValidationFailure from './validation-failure';

class InvalidParameterExample extends ValidationFailure {
  constructor(path: string[]) {
    super(
      'Parameter object can have either example or examples set, but not both.',
      path,
    );
  }
}

export default InvalidParameterExample;
