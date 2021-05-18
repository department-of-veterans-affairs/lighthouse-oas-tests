import ValidationFailure from './validation-failure';

class InvalidParameterExample extends ValidationFailure {
  constructor(path: string[]) {
    super(
      "The 'example' field is mutually exclusive of the 'examples' field, provide one or the other or neither, but not both.",
      path,
    );
  }
}

export default InvalidParameterExample;
