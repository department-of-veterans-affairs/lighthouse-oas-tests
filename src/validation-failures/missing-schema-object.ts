import ValidationFailure from './validation-failure';

class MissingSchemaObject extends ValidationFailure {
  constructor(path: string[]) {
    super('Parameter is missing a schema object.', path);
  }
}

export default MissingSchemaObject;
