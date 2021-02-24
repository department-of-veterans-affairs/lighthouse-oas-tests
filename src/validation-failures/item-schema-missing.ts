import ValidationFailure from './validation-failure';

class ItemSchemaMissing extends ValidationFailure {
  constructor(path: string[]) {
    super('The items property is required for array schemas.', path);
  }
}

export default ItemSchemaMissing;
