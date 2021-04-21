import { OASSecurityType } from '../utilities/oas-security/oas-security-scheme';
import SecurityFailure from './security-failure';

class MissingAPIKey extends SecurityFailure {
  constructor() {
    super(
      'The apikey is missing and there is an apikey security type in the security schemes.',
      OASSecurityType.APIKEY,
    );
  }
}

export default MissingAPIKey;
