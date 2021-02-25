import ValidationFailure from './validation-failure';

class PropertySchemaMissing extends ValidationFailure {
  constructor(path: string[]) {
    super('The properties property is required for object schemas.', path);
  }
}

export default PropertySchemaMissing;
