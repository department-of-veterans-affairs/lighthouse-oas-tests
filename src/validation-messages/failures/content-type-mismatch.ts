import ValidationFailure from './validation-failure';

class ContentTypeMismatch extends ValidationFailure {
  constructor(contentType: string) {
    super(
      `Response content type not present in schema. Actual content type: ${contentType}`,
      [],
    );
  }
}

export default ContentTypeMismatch;
