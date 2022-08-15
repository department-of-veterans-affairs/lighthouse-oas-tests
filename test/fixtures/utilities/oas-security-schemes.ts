import { OASSecurityScheme } from '../../../src/oas-parsing/security';

export const securitySchemeAPIKey = new OASSecurityScheme('apikey', {
  type: 'apiKey',
  in: 'header',
  name: 'apikey',
});

export const securitySchemeTeacherAPIKey = new OASSecurityScheme('teacher', {
  type: 'apiKey',
  in: 'header',
  name: 'teacherapikey',
});

export const securitySchemeHTTPBearer = new OASSecurityScheme('bearer_token', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const securitySchemeOauth = new OASSecurityScheme('oauth', {
  type: 'oauth2',
});
