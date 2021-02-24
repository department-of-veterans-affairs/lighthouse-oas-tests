import ValidationFailure from './validation-failure';

class PropertiesMismatch extends ValidationFailure {
  constructor(
    path: string[],
    schemaProperties: string[],
    actualProperties: string[],
  ) {
    super(
      `Actual object contains a property not present in schema. Schema properties: ${schemaProperties.join(
        ', ',
      )}. Actual properties: ${actualProperties.join(', ')}.`,
      path,
    );
  }
}

export default PropertiesMismatch;
