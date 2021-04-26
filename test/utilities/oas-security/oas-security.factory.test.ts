import { OASSecurityFactory } from '../../../src/utilities/oas-security';

describe('OASSecurityFactory', () => {
  const schema = {
    components: {
      securitySchemes: {
        'phial-of-galadriel': {
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
    },
    security: {
      'phial-of-galadriel': [],
    },
  };
  describe('getSecuritySchemes', () => {
    it('returns all schemes', () => {
      const securitySchemes = OASSecurityFactory.getSecuritySchemes(
        schema.components.securitySchemes,
      );
      const apiKey = securitySchemes.filter(
        (scheme) => scheme.securityType === 'apiKey',
      );
      expect(securitySchemes).toHaveLength(2);
      expect(apiKey[0].key).toBe('phial-of-galadriel');
      expect(apiKey[0].name).toBe('X-PHIAL-OF-GALADRIEL');
    });
  });
  describe('getSecurities', () => {
    it('returns all securities', () => {
      const securities = OASSecurityFactory.getSecurities(schema.security);
      expect(securities).toHaveLength(1);
      expect(securities[0].key).toBe('phial-of-galadriel');
    });
  });
});
