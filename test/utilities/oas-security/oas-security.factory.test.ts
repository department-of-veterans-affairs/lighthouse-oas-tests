import {
  ComponentsObject,
  OpenAPIObject,
  SecurityRequirementObject,
  SecuritySchemesObject,
} from 'swagger-client';
import { OASSecurityFactory } from '../../../src/utilities/oas-security';

describe('OASSecurityFactory', () => {
  const schema: OpenAPIObject = {
    paths: {
      '/gifts_of_galadriel': {},
    },
    components: {
      securitySchemes: {
        phial_of_galadriel: {
          name: 'X-PHIAL-OF-GALADRIEL',
          description: 'a light in the darkness',
          type: 'apiKey',
          in: 'header',
        },
        isengard: {
          type: 'http',
          scheme: 'basic',
        },
      },
    } as ComponentsObject,
    servers: [
      {
        url: 'https://lotr.com/services/lady-of-light',
      },
    ],
    security: [
      {
        phial_of_galadriel: [],
      },
    ],
  };

  describe('getSecuritySchemes', () => {
    it('returns all schemes', () => {
      const securitySchemes = OASSecurityFactory.getSecuritySchemes(
        schema.components?.securitySchemes as SecuritySchemesObject,
      );
      const apiKey = securitySchemes.filter(
        (scheme) => scheme.type === 'apiKey',
      );
      expect(securitySchemes).toHaveLength(2);
      expect(apiKey[0].key).toBe('phial_of_galadriel');
      expect(apiKey[0].name).toBe('X-PHIAL-OF-GALADRIEL');
    });
  });
  describe('getSecurities', () => {
    it('returns all securities', () => {
      const securities = OASSecurityFactory.getSecurities(
        schema.security as SecurityRequirementObject[],
      );
      expect(securities).toHaveLength(1);
      expect(securities[0].key).toBe('phial_of_galadriel');
    });
  });
});
