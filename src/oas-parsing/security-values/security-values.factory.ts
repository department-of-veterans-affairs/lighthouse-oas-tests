import { BEARER_SECURITY_SCHEME } from '../../utilities/constants';
import { OASSecurityScheme, OASSecurityType } from '../security';
import { SecurityValues } from 'swagger-client';

export default class SecurityValuesFactory {
  public static buildFromSecuritySchemes(
    securitySchemes: OASSecurityScheme[],
    apiKey: string | undefined,
    token: string | undefined,
  ): SecurityValues {
    const securityValues: SecurityValues = {};

    for (const securityScheme of securitySchemes) {
      if (securityScheme.type === OASSecurityType.APIKEY) {
        const apiSecurityName = securityScheme.key;
        if (!apiKey) {
          throw new Error(
            `API key is undefined or empty but required by the ${apiSecurityName} security`,
          );
        }

        securityValues[apiSecurityName] = { value: apiKey };
      } else if (
        (securityScheme.type === OASSecurityType.HTTP &&
          securityScheme.scheme === BEARER_SECURITY_SCHEME) ||
        securityScheme.type === OASSecurityType.OAUTH2
      ) {
        const tokenSecurityName = securityScheme.key;
        if (!token) {
          throw new Error(
            `Token is undefined or empty but required by the ${tokenSecurityName} security`,
          );
        }

        if (securityScheme.type === OASSecurityType.HTTP) {
          securityValues[tokenSecurityName] = { value: token };
        } else if (securityScheme.type === OASSecurityType.OAUTH2) {
          securityValues[tokenSecurityName] = {
            token: { access_token: token },
          };
        }
      }
    }

    return securityValues;
  }
}
