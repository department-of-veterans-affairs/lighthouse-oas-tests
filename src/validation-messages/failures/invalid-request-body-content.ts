import ValidationFailure from './validation-failure';

class InvalidRequestBodyContent extends ValidationFailure {
  constructor(path: string[]) {
    super('Request body content object should only have one key.', path);
  }
}

export default InvalidRequestBodyContent;
