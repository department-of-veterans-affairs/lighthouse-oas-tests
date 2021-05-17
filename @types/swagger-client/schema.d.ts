declare module 'swagger-client/schema' {
  type Json = ReturnType<JSON['parse']>;

  interface OpenAPIObject {
    paths: PathsObject;
  }

  export interface PathsObject { [path: string]: PathItemObject }
  export interface OperationObject {
    operationId: string;
    parameters: ParameterObject[];
    responses: { [responseStatus: string]: ResponseObject };
  }
  interface PathItemObject {
    get?: OperationObject;
    post?: OperationObject;
    put?: OperationObject;
    delete?: OperationObject;
    patch?: OperationObject;
    parameters?: ParameterObject[];
  }

  interface ParameterAndHeaderBase {
    description?: string;
    required?: boolean;
    example?: Json;
    examples?: { [name: string]: ExampleObject };
  }

  interface ParameterBase extends ParameterAndHeaderBase {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
  }

  export interface ResponseObject {
    description: string;
    content: {[contentType: string]: MediaTypeObject}
  }

  export interface ParameterWithSchema extends ParameterBase {
    schema: SchemaObject;
  }

  export interface ParameterWithContent extends ParameterBase {
    content: { [name: string]: MediaTypeObject };
  }

  export type ParameterObject = ParameterWithContent | ParameterWithSchema;

  export interface MediaTypeObject {
    schema: SchemaObject;
    example?: Json;
    examples?: { [name: string]: ExampleObject };
    encoding?: { [name: string]: EncodingObject };
  }

  export interface EncodingObject {
    contentType?: string;
    headers?: { [name: string]: HeaderObject };
    style?: string;
    explode?: boolean;
    allowReserved: boolean;
  }

  export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }

  export interface HeaderObject extends ParameterAndHeaderBase {
    schema?: SchemaObject;
    content?: { [name: string]: MediaTypeObject };
  }

  export interface SchemaObject {
    type?: 'number' | 'string' | 'object' | 'array' | 'integer';
    required?: string[];
    items?: SchemaObject;
    properties?: { [property: string]: SchemaObject };
    description?: string;
    enum?: Json[];
    nullable?: boolean;
  }
}
