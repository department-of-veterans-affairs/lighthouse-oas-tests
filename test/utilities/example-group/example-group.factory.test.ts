import { ExampleGroupFactory } from '../../../src/utilities/example-group';
import OASOperation from '../../../src/utilities/oas-operation';

describe('ExampleGroupFactory', () => {
  describe('getExampleGroups', () => {
    let ageParameter;

    beforeEach(() => {
      ageParameter = {
        name: 'age',
        in: 'query',
        required: true,
        example: 111,
        schema: {
          type: 'integer',
          description: 'a number',
        },
      };
    });

    describe('the examples field is not set', () => {
      let familyParameter;

      beforeEach(() => {
        familyParameter = {
          name: 'family',
          in: 'query',
          example: 'baggins',
          schema: {
            type: 'string',
            description: 'a string',
          },
        };
      });

      it('returns examples in the default group', () => {
        familyParameter.required = true;

        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [ageParameter, familyParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          age: 111,
          family: 'baggins',
        });
      });

      it('non-required parameter examples are merged into the default group when example is set', () => {
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [ageParameter, familyParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.examples).toEqual({
          age: 111,
          family: 'baggins',
        });
      });
    });

    describe('the examples field is set', () => {
      let familyParameter;

      beforeEach(() => {
        familyParameter = {
          name: 'family',
          in: 'query',
          examples: {
            personal: {
              value: 'baggins',
            },
          },
          schema: {
            type: 'string',
            description: 'a string',
          },
        };
      });

      describe('no default key', () => {
        it('returns grouped parameters', () => {
          ageParameter.required = false;
          ageParameter.examples = {
            personal: {
              value: 111,
            },
          };
          delete ageParameter.example;

          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(2);
          const group = groups[0];
          expect(group.name).toEqual('personal');
          expect(group.examples).toEqual({
            age: 111,
            family: 'baggins',
          });

          const defaultGroup = groups[1];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({});
        });

        it('includes required examples in all groups', () => {
          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(2);
          const group = groups[0];
          expect(group.name).toEqual('personal');
          expect(group.examples).toEqual({
            age: 111,
            family: 'baggins',
          });

          const defaultGroup = groups[1];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({
            age: 111,
          });
        });

        it('returns all groups present', () => {
          familyParameter.examples = {
            personal: {
              value: 'baggins',
            },
            temporary: {
              value: 'underhill',
            },
          };

          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(3);
          const firstGroup = groups[0];
          expect(firstGroup.name).toEqual('personal');
          expect(firstGroup.examples).toEqual({
            age: 111,
            family: 'baggins',
          });
          const secondGroup = groups[1];
          expect(secondGroup.name).toEqual('temporary');
          expect(secondGroup.examples).toEqual({
            age: 111,
            family: 'underhill',
          });
          const defaultGroup = groups[2];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({
            age: 111,
          });
        });

        it('does not merge required parameters without the default key', () => {
          familyParameter.required = true;

          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(2);
          const group = groups[0];
          expect(group.name).toEqual('personal');
          expect(group.examples).toEqual({
            age: 111,
            family: 'baggins',
          });

          const defaultGroup = groups[1];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({
            age: 111,
            family: undefined,
          });
        });
      });

      describe('default key is present', () => {
        let actorParameter;

        beforeEach(() => {
          actorParameter = {
            name: 'actor',
            in: 'query',
            required: true,
            examples: {
              default: {
                value: 'Ian Holm',
              },
              temporary: {
                value: 'Martin Freeman',
              },
            },
            schema: {
              type: 'string',
              description: 'a string',
            },
          };
        });

        it('merges required examples with default key into all groups', () => {
          familyParameter.examples = {
            personal: {
              value: 'baggins',
            },
            temporary: {
              value: 'underhill',
            },
          };

          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter, actorParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(3);
          const firstGroup = groups[0];
          expect(firstGroup.name).toEqual('personal');
          expect(firstGroup.examples).toEqual({
            age: 111,
            family: 'baggins',
            actor: 'Ian Holm',
          });
          const secondGroup = groups[1];
          expect(secondGroup.name).toEqual('temporary');
          expect(secondGroup.examples).toEqual({
            age: 111,
            family: 'underhill',
            actor: 'Martin Freeman',
          });
          const defaultGroup = groups[2];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({
            age: 111,
            actor: 'Ian Holm',
          });
        });

        it('merges non-required examples with default key into appropriate groups', () => {
          familyParameter.examples = {
            personal: {
              value: 'baggins',
            },
            temporary: {
              value: 'underhill',
            },
          };

          actorParameter.required = false;

          const operation = new OASOperation({
            operationId: '123',
            responses: {},
            parameters: [ageParameter, familyParameter, actorParameter],
          });
          const groups = ExampleGroupFactory.buildFromOperation(operation);

          expect(groups).toHaveLength(3);
          const firstGroup = groups[0];
          expect(firstGroup.name).toEqual('personal');
          expect(firstGroup.examples).toEqual({
            age: 111,
            family: 'baggins',
          });
          const secondGroup = groups[1];
          expect(secondGroup.name).toEqual('temporary');
          expect(secondGroup.examples).toEqual({
            age: 111,
            family: 'underhill',
            actor: 'Martin Freeman',
          });
          const defaultGroup = groups[2];
          expect(defaultGroup.name).toEqual('default');
          expect(defaultGroup.examples).toEqual({
            age: 111,
            actor: 'Ian Holm',
          });
        });
      });
    });

    describe('the example is set on the parameter and schema', () => {
      it('returns the example found on the parameter', () => {
        const raceParameter = {
          name: 'race',
          in: 'query',
          required: true,
          example: 'dwarves',
          schema: {
            type: 'string',
            description: 'a race in middle earth',
            example: 'elves',
          },
        };
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [raceParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          race: 'dwarves',
        });
      });
    });

    describe('the example is set on the schema only', () => {
      it('returns the example found on the schema', () => {
        const raceParameter = {
          name: 'race',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            description: 'a race in middle earth',
            example: 'elves',
          },
        };
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [raceParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          race: 'elves',
        });
      });
    });

    describe('the example is set on the content only', () => {
      it('returns the example found on the content', () => {
        const raceParameter = {
          name: 'race',
          in: 'query',
          required: true,
          schema: {
            type: 'string',
            description: 'a race in middle earth',
          },
          content: {
            'application/json': {
              example: 'hobbits',
            },
          },
        };
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [raceParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          race: 'hobbits',
        });
      });
    });

    describe('the examples field is set on the parameter and content', () => {
      it('returns the examples found on the parameter', () => {
        const raceParameter = {
          name: 'race',
          in: 'query',
          required: true,
          examples: {
            default: {
              value: 'men',
            },
          },
          content: {
            'application/json': {
              examples: {
                default: {
                  value: 'hobbits',
                },
              },
              schema: {
                type: 'string',
                description: 'a race in middle earth',
              },
            },
          },
        };
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [raceParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          race: 'men',
        });
      });
    });

    describe('the examples field is set on the content', () => {
      it('returns the examples found on the content', () => {
        const raceParameter = {
          name: 'race',
          in: 'query',
          required: true,
          content: {
            'application/json': {
              examples: {
                default: {
                  value: 'hobbits',
                },
              },
            },
          },
        };
        const operation = new OASOperation({
          operationId: '123',
          responses: {},
          parameters: [raceParameter],
        });
        const groups = ExampleGroupFactory.buildFromOperation(operation);

        expect(groups).toHaveLength(1);
        const defaultGroup = groups[0];
        expect(defaultGroup.name).toEqual('default');
        expect(defaultGroup.examples).toEqual({
          race: 'hobbits',
        });
      });
    });
  });
});
