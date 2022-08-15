import ExampleGroup from '../../../src/oas-parsing/example-group';

describe('ExampleGroup', () => {
  describe('getName', () => {
    it('returns the name', () => {
      const group = new ExampleGroup('test', {});

      expect(group.name).toEqual('test');
    });
  });

  describe('getExamples', () => {
    it('returns the examples', () => {
      const group = new ExampleGroup('test', {
        hello: 'arda',
      });

      expect(group.examples).toEqual({ hello: 'arda' });
    });
  });
});
