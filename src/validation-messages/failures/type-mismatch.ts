import ValidationFailure from './validation-failure';

class TypeMismatch extends ValidationFailure {
  constructor(path: string[], schemaType: string, actualType: string) {
    super(
      `Actual type did not match schema. Schema type: ${schemaType}. Actual type: ${actualType}.`,
      path,
    );
  }
}

export default TypeMismatch;
