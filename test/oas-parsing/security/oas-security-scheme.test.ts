import { OASSecurityScheme } from '../../../src/oas-parsing/security';

describe('OASSecurityScheme', () => {
  it('should return a Security Scheme object', () => {
    const securityScheme = new OASSecurityScheme('riddle', {
      type: 'http',
      description: 'Speak friend and enter',
      name: 'doors-of-durin',
      in: 'query',
    });

    expect(securityScheme).toEqual({
      key: 'riddle',
      type: 'http',
      description: 'Speak friend and enter',
      name: 'doors-of-durin',
      in: 'query',
    });
  });
});
