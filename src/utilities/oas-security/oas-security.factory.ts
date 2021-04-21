import { SecuritySchemesObject } from 'swagger-client';
import OASSecurityScheme from './oas-security-scheme';

class OASSecurityFactory {
  public static getSecuritySchemes(
    securitySchemes: SecuritySchemesObject,
  ): OASSecurityScheme[] {
    const securitySchemeObjects = Object.values(securitySchemes);

    return securitySchemeObjects.map(
      (securityScheme) => new OASSecurityScheme(securityScheme),
    );
  }
}

export default OASSecurityFactory;
