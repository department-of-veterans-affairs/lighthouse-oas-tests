import { Json } from 'swagger-client';
import ValidationFailure from './validation-failure';

class EnumMismatch extends ValidationFailure {
  constructor(path: string[], enumValues: Json[], actualValue: Json) {
    super(
      `Actual value does not match schema enum. Enum values: ${JSON.stringify(
        enumValues,
      )}. Actual value: ${JSON.stringify(actualValue)}.`,
      path,
    );
  }
}

export default EnumMismatch;
