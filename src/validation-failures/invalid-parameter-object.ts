import ValidationFailure from './validation-failure';

class InvalidParameterObject extends ValidationFailure {
  constructor(path: string[]) {
    super(
      'Parameter object must have either schema or content set, but not both.',
      path,
    );
  }
}

export default InvalidParameterObject;
