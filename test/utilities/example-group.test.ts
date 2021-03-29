import ExampleGroup from '../../src/utilities/example-group';
import OASOperation from '../../src/utilities/oas-operation';

describe('ExampleGroup', () => {
  describe('getName', () => {
    it('returns the name', () => {
      const group = new ExampleGroup({} as OASOperation, 'test', {});

      expect(group.getName()).toEqual('test');
    });
  });

  describe('getExamples', () => {
    it('returns the examples', () => {
      const group = new ExampleGroup({} as OASOperation, 'test', {
        hello: 'world',
      });

      expect(group.getExamples()).toEqual({ hello: 'world' });
    });
  });
});
