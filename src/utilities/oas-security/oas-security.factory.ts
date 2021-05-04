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
    securityRequirements: SecurityRequirementObject[] | undefined,
  ): OASSecurity[] {
    if (!securityRequirements) {
      return [];
    }

    return securityRequirements.map(
      (securityRequirement) =>
        new OASSecurity(
          Object.keys(securityRequirement)[0],
          securityRequirement.scopes,
        ),
    );
  }
}

export default OASSecurityFactory;
