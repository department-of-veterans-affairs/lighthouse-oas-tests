import {
  CONTENT_TYPE_MISMATCH_ERROR,
  CONTENT_TYPE_PREFIX,
} from '../utilities/constants';

class ContentTypeMismatchError extends TypeError {
  constructor(contentType: string) {
    super(
      `${CONTENT_TYPE_MISMATCH_ERROR}. ${CONTENT_TYPE_PREFIX} ${contentType}`,
    );

    Object.setPrototypeOf(this, ContentTypeMismatchError.prototype);
  }
}

export default ContentTypeMismatchError;
