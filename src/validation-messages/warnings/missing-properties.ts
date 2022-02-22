import ValidationWarning from './validation-warning';

class MissingProperties extends ValidationWarning {
  constructor(missingParameters, path) {
    super(
      `This object is missing non-required properties that were unable to be validated, including ${missingParameters.join(
        ', ',
      )}.`,
      path,
    );
  }
}

export default MissingProperties;
