import ValidationFailure from './validation-failure';

class InvalidParameterContent extends ValidationFailure {
  constructor(path: string[]) {
    super('Parameter content object should only have one key.', path);
  }
}

export default InvalidParameterContent;
