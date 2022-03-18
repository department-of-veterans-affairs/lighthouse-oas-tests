import { OperationObject, ResponseObject } from 'swagger-client/schema';

const defaultResponses: { [responseCode: string]: ResponseObject } = {
  '200': {
    description: '',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
};

const hobbitsResponse: { [responseCode: string]: ResponseObject } = {
  '200': {
    description: '',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  one: {
                    type: 'number',
                  },
                  two: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const getHobbit: OperationObject = {
  operationId: 'getHobbit',
  responses: defaultResponses,
  parameters: [
    {
      name: 'name',
      in: 'query',
      schema: {
        type: 'string',
      },
      example: 'Frodo',
    },
  ],
};

const getHobbits: OperationObject = {
  operationId: 'getHobbits',
  responses: hobbitsResponse,
  parameters: [
    {
      name: 'name',
      in: 'query',
      schema: {
        type: 'string',
      },
      example: 'Frodo',
    },
  ],
};

const getTomBombadil: OperationObject = {
  operationId: 'getTomBombadil',
  responses: defaultResponses,
  parameters: [
    {
      name: 'times',
      in: 'query',
      example: 2,
      schema: {
        type: 'number',
      },
    },
  ],
};

const walkIntoMordorIntEx: OperationObject = {
  operationId: 'walkIntoMordor',
  responses: defaultResponses,
  parameters: [
    {
      name: 'guide',
      in: 'query',
      schema: {
        type: 'string',
      },
      required: true,
      example: 42,
    },
  ],
};

const walkIntoMordorStrEx: OperationObject = {
  operationId: 'walkIntoMordor',
  responses: defaultResponses,
  parameters: [
    {
      name: 'guide',
      in: 'query',
      schema: {
        type: 'string',
      },
      required: true,
      example: 'golem',
    },
  ],
};

const walkIntoMordorIntExs: OperationObject = {
  operationId: 'walkIntoMordor',
  responses: defaultResponses,
  parameters: [
    {
      name: 'door',
      in: 'query',
      schema: {
        type: 'string',
      },
      examples: {
        door: {
          value: 2,
        },
      },
    },
    {
      name: 'guide',
      in: 'query',
      schema: {
        type: 'string',
      },
      examples: {
        guided: {
          value: 'gollum',
        },
      },
    },
  ],
};

const walkIntoMordorStrExs: OperationObject = {
  operationId: 'walkIntoMordor',
  responses: defaultResponses,
  parameters: [
    {
      name: 'door',
      in: 'query',
      schema: {
        type: 'string',
      },
      examples: {
        door: {
          value: 'front',
        },
      },
    },
    {
      name: 'guide',
      in: 'query',
      schema: {
        type: 'string',
      },
      examples: {
        guided: {
          value: 'gollum',
        },
      },
    },
  ],
};

export {
  getHobbit,
  getHobbits,
  getTomBombadil,
  walkIntoMordorIntEx,
  walkIntoMordorStrEx,
  walkIntoMordorIntExs,
  walkIntoMordorStrExs,
};
