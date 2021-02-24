import ValidationFailure from './validation-failure';

class RequiredProperty extends ValidationFailure {
  constructor(path: string[], requiredProperty: string) {
    super(
      `Actual object missing required property. Required property: ${requiredProperty}.`,
      path,
    );
  }
}

export default RequiredProperty;
