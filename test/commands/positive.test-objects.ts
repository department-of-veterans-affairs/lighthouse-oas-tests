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

export { getHobbit, getHobbits, getTomBombadil };
