import ValidationWarning from './validation-warning';

class EmptyArray extends ValidationWarning {
  constructor(path) {
    super(
      'This array was found to be empty and therefore the items within it were not validated.',
      path,
    );
  }
}

export default EmptyArray;
