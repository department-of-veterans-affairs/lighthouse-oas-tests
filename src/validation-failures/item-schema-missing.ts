import { ITEMS_MISSING_ERROR, PATH_PREFIX } from '../utilities/constants';
import ValidationFailure from './validation-failure';

class ItemSchemaMissing extends ValidationFailure {
  constructor(path: string[]) {
    super(`${ITEMS_MISSING_ERROR}. ${PATH_PREFIX} ${path.join(' -> ')}`);
  }
}

export default ItemSchemaMissing;
