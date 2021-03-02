import ValidationFailure from './validation-failure';

class MissingContentSchemaObject extends ValidationFailure {
  constructor(path: string[]) {
    super(
      'The media type obejct in the content field is missing a schema object.',
      path,
    );
  }
}

export default MissingContentSchemaObject;
