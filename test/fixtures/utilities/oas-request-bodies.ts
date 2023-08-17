import { RequestBodyObject } from 'swagger-client';

export const requestBodyValid: RequestBodyObject = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['firstName', 'lastName', 'house', 'year'],
        properties: {
          firstName: {
            type: 'string',
            example: 'Hermione',
          },
          lastName: {
            type: 'string',
            example: 'Granger',
          },
          house: {
            type: 'string',
            enum: ['Gryffindor', 'Hufflepuff', 'Slytherin', 'Ravenclaw'],
            example: 'Slytherin',
          },
          year: {
            type: 'integer',
            example: 2,
          },
        },
      },
    },
  },
};

export const requestBodyOptionalPropertiesMediaTypeExample: RequestBodyObject =
  {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['age', 'home'],
          properties: {
            age: {
              type: 'string',
            },
            home: {
              type: 'string',
            },
            hobby: {
              type: 'string',
            },
          },
        },
        example: {
          age: 'eleventy one',
          home: 'The Shire',
          hobby: 'eating',
        },
      },
    },
  };

export const requestBodyMissingSchema: RequestBodyObject = {
  required: true,
  content: {
    'application/json': {},
  },
} as unknown as RequestBodyObject;

export const requestBodyWithFailures: RequestBodyObject = {
  required: true,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['firstName', 'lastName', 'house', 'year', 'classes'],
        properties: {
          firstName: {
            type: 'string',
            example: 'Hermione',
          },
          lastName: {
            type: 'string',
            example: 'Granger',
          },
          house: {
            type: 'string',
            enum: [
              'Gryffindor',
              'Hufflepuff',
              'Hufflepuff',
              'Slytherin',
              'Ravenclaw',
            ],
            example: 'NotAHouse',
          },
          year: {
            type: 'integer',
            example: 'two',
          },
          classes: {
            type: 'array',
            example: [],
            items: {
              type: 'string',
            },
          },
          hobby: {
            type: 'string',
            example: 'studying',
          },
        },
      },
    },
  },
};
