import ValidationWarning from './validation-warning';

class EmptyArray extends ValidationWarning {
  constructor(path) {
    super(
      'This array was found to be empty and therefore could not be validated.',
      path,
    );
  }
}

export default EmptyArray;
