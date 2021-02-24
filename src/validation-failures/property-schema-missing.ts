import { PATH_PREFIX, PROPERTIES_MISSING_ERROR } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class PropertySchemaMissing extends ValidationFailure {
  constructor(path: string[]) {
    super(`${PROPERTIES_MISSING_ERROR}. ${PATH_PREFIX} ${path.join(' -> ')}`);
  }
}

export default PropertySchemaMissing;
