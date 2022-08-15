import { SecurityValuesFactory } from '../../../src/oas-parsing/security-values';
import {
  securitySchemeAPIKey,
  securitySchemeHTTPBearer,
  securitySchemeOauth,
} from '../../fixtures/utilities/oas-security-schemes';
import { securityValuesAPIKeyBearerOauth } from '../../fixtures/utilities/security-values';

describe('SecurityValuesFactory', () => {
  describe('buildFromSecuritySchemes', () => {
    it('returns an empty object when securitySchemes is empty', () => {
      const securityValues = SecurityValuesFactory.buildFromSecuritySchemes(
        [],
        'apikey',
        'token',
      );
      expect(securityValues).toEqual({});
    });

    it('throws an error if there is an apiKey security scheme and apiKey is undefined', () => {
      expect(() =>
        SecurityValuesFactory.buildFromSecuritySchemes(
          [securitySchemeAPIKey],
          undefined,
          'token',
        ),
      ).toThrow(
        'API key is undefined or empty but required by the apikey security',
      );
    });

    it('throws an error if there is an http bearer security scheme and token is undefined', () => {
      expect(() =>
        SecurityValuesFactory.buildFromSecuritySchemes(
          [securitySchemeHTTPBearer],
          'apikey',
          undefined,
        ),
      ).toThrow(
        'Token is undefined or empty but required by the bearer_token security',
      );
    });

    it('returns the expected SecurityValues object', () => {
      const securityValues = SecurityValuesFactory.buildFromSecuritySchemes(
        [securitySchemeAPIKey, securitySchemeHTTPBearer, securitySchemeOauth],
        'apikey',
        'token',
      );

      expect(securityValues).toEqual(securityValuesAPIKeyBearerOauth);
    });
  });
});
