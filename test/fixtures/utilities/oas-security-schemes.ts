import { OASSecurityScheme } from '../../../src/utilities/oas-security';

export const apiKeyScheme = new OASSecurityScheme('apikey', {
  type: 'apiKey',
  in: 'header',
  name: 'apikey',
});

export const teacherAPIKeyScheme = new OASSecurityScheme('teacher', {
  type: 'apiKey',
  in: 'header',
  name: 'teacherapikey',
});

export const httpBearerScheme = new OASSecurityScheme('bearer_token', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export const oauthScheme = new OASSecurityScheme('oauth', {
  type: 'oauth2',
});
