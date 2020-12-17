import ParameterWrapper from '../../src/utilities/parameter-wrapper';

describe('ParameterWrapper', () => {
  describe('unwrapParameters', () => {
    describe('unexpected parameters format', () => {
      it('throws an error', () => {
        const parameterExamples = {
          where: {
            door: 'front',
          },
          who: {
            guide: 'gollum',
          },
        };

        expect(() => {
          ParameterWrapper.unwrapParameters(parameterExamples);
        }).toThrow(
          `Unexpected parameters format: ${JSON.stringify(parameterExamples)}`,
        );
      });
    });

    it('removes the grouping from the parameters', () => {
      expect(
        ParameterWrapper.unwrapParameters({
          groupName: {
            foo: 'bar',
          },
        }),
      ).toEqual({
        foo: 'bar',
      });
    });
  });

  describe('wrapParameters', () => {
    describe('no group name is provided', () => {
      it('wraps it with the default group name', () => {
        expect(
          ParameterWrapper.wrapParameters({
            foo: 'bar',
          }),
        ).toEqual({
          default: {
            foo: 'bar',
          },
        });
      });
    });
    describe('group name is provided', () => {
      it('wraps it with the given group name', () => {
        expect(
          ParameterWrapper.wrapParameters(
            {
              foo: 'bar',
            },
            'testGroup',
          ),
        ).toEqual({
          testGroup: {
            foo: 'bar',
          },
        });
      });
    });
  });
});
