import {
  CONTENT_TYPE_MISMATCH_ERROR,
  CONTENT_TYPE_PREFIX,
} from '../utilities/constants';
import ValidationFailure from './validation-failure';

class ContentTypeMismatch extends ValidationFailure {
  constructor(contentType: string) {
    super(
      `${CONTENT_TYPE_MISMATCH_ERROR}. ${CONTENT_TYPE_PREFIX} ${contentType}`,
    );
  }
}

export default ContentTypeMismatch;
