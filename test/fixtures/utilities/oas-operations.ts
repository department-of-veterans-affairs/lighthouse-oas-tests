import OASOperation from '../../../src/utilities/oas-operation';

export const harryPotterOperation = new OASOperation({
  operationId: 'GET:/harryPotter',
  responses: {},
});

export const heWhoMustNotBeNamedOperation = new OASOperation({
  operationId: 'GET:/he-who-must-not-be-named',
  responses: {},
  parameters: [
    {
      name: 'name',
      in: 'query',
      schema: { type: 'string' },
      examples: {
        default: { value: 'voldermort' },
        tomRiddle: { value: 'tomRiddle' },
      },
    },
  ],
});
