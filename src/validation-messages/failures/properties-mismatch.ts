import ValidationFailure from './validation-failure';

class PropertiesMismatch extends ValidationFailure {
  constructor(
    path: string[],
    schemaProperties: string[],
    actualProperties: string[],
  ) {
    let message = `Actual object contains a property not present in schema. Actual properties not expected: ${actualProperties.join(
      ', ',
    )}.`;

    if (schemaProperties.length > 0) {
      message = message.concat(
        ` Schema properties not found: ${schemaProperties.join(', ')}.`,
      );
    }

    super(message, path);
  }
}

export default PropertiesMismatch;
