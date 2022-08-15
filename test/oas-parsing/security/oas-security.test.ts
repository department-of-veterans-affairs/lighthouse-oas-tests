import OASSecurity from '../../../src/oas-parsing/security';

describe('OASSecurity', () => {
  describe('getKey', () => {
    it('returns the key', () => {
      const oasSecurity = new OASSecurity('glorfindel', ['rivendell']);
      expect(oasSecurity.key).toBe('glorfindel');
    });
  });

  describe('getScopes', () => {
    it('returns the scopes', () => {
      const oasSecurity = new OASSecurity('glorfindel', ['rivendell']);
      expect(oasSecurity.scopes).toEqual(['rivendell']);
    });
  });
});
