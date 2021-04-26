import { SecuritySchemesObject } from 'swagger-client';
import { SecurityRequirementObject } from 'swagger-client/schema';
import OASSecurity from './oas-security';
import OASSecurityScheme from './oas-security-scheme';

class OASSecurityFactory {
  public static getSecuritySchemes(
    securitySchemes: SecuritySchemesObject,
  ): OASSecurityScheme[] {
    const securitySchemeObjectsKeys = Object.keys(securitySchemes);
    return securitySchemeObjectsKeys.map(
      (key) => new OASSecurityScheme(key, securitySchemes[key]),
    );
  }

  public static getSecurities(
    securityRequirement: SecurityRequirementObject | undefined,
  ): OASSecurity[] {
    if (!securityRequirement) {
      return [];
    }

    return Object.keys(securityRequirement).map(
      (key) => new OASSecurity(key, securityRequirement[key]),
    );
  }
}

export default OASSecurityFactory;
