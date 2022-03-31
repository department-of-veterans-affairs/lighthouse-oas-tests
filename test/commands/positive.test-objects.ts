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

const walkIntoMordorSingleParameterInvalid: OperationObject = {
  operationId: 'walkIntoMordorWithAnInvalidGuide',
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

const walkIntoMordorSingleParameter: OperationObject = {
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

const walkIntoMordorMultiParameterInvalid: OperationObject = {
  operationId: 'walkIntoMordorWithAnInvalidDoor',
  responses: defaultResponses,
  parameters: [
    {
      name: 'doorWithAnInvalidExample',
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

const walkIntoMordorMultiParameter: OperationObject = {
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

const flyIntoMordorInvalid: OperationObject = {
  operationId: 'flyIntoMordorWithInvalidCargo',
  responses: defaultResponses,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['eagle', 'hobbit', 'cargo', 'difficult'],
          properties: {
            eagle: {
              type: 'string',
              example: 'Gwaihir',
            },
            hobbit: {
              type: 'string',
              example: 'Frodo',
            },
            cargo: {
              type: 'string',
              example: 0,
            },
            difficult: {
              type: 'string',
              enum: ['Y', 'N'],
              example: 'N',
            },
          },
        },
      },
    },
  },
};

const flyIntoMordorInvalidContent: OperationObject = {
  operationId: 'flyIntoMordorWithMoreThanOneContent',
  responses: defaultResponses,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: [],
        },
      },
      'text/plain': {
        schema: {},
      },
    },
  },
};

const flyIntoMordor: OperationObject = {
  operationId: 'flyIntoMordor',
  responses: defaultResponses,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['eagle', 'hobbit', 'cargo', 'difficult'],
          properties: {
            eagle: {
              type: 'string',
              example: 'Gwaihir',
            },
            hobbit: {
              type: 'string',
              example: 'Frodo',
            },
            cargo: {
              type: 'string',
              example: 'The One Ring',
            },
            difficult: {
              type: 'string',
              enum: ['Y', 'N'],
              example: 'N',
            },
          },
        },
      },
    },
  },
};

export {
  getHobbit,
  getHobbits,
  getTomBombadil,
  walkIntoMordorSingleParameterInvalid,
  walkIntoMordorSingleParameter,
  walkIntoMordorMultiParameterInvalid,
  walkIntoMordorMultiParameter,
  flyIntoMordorInvalid,
  flyIntoMordorInvalidContent,
  flyIntoMordor,
};
