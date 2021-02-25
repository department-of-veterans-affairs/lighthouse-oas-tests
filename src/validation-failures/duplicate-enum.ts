import { Json } from 'swagger-client';
import ValidationFailure from './validation-failure';

class DuplicateEnum extends ValidationFailure {
  constructor(path: string[], enumValues: Json[]) {
    super(
      `Schema enum contains duplicate values. Enum values: ${JSON.stringify(
        enumValues,
      )}.`,
      path,
    );
  }
}

export default DuplicateEnum;
