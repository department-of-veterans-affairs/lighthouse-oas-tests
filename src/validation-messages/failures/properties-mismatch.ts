import ValidationFailure from './validation-failure';

class PropertiesMismatch extends ValidationFailure {
  constructor(
    path: string[],
    schemaPropertiesNotFound: string[],
    unexpectedActualProperties: string[],
  ) {
    let message = `Actual object contains a property not present in schema. Actual properties not expected: ${unexpectedActualProperties.join(
      ', ',
    )}.`;

    if (schemaPropertiesNotFound.length > 0) {
      message = message.concat(
        ` Schema properties not found: ${schemaPropertiesNotFound.join(', ')}.`,
      );
    }

    super(message, path);
  }
}

export default PropertiesMismatch;
