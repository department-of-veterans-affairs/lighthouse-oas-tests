declare module 'swagger-client/schema' {
  type Json = ReturnType<JSON['parse']>;

  interface OpenAPIObject {
    paths: PathsObject;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
    servers?: ServerObject[];
  }

  interface ServerObject {
    url: string;
    description?: string;
    variables?: {
      [variableName: string]: ServerVariableObject;
    };
  }

  type NonEmptyArray<T> = [T, ...T[]];

  interface ServerVariableObject {
    enum?: NonEmptyArray<string>;
    default: string;
    description?: string;
  }

  interface ComponentsObject {
    securitySchemes: SecuritySchemesObject;
  }

  export interface PathsObject {
    [path: string]: PathItemObject;
  }

  interface PathItemObject {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OperationObject;
    put?: OperationObject;
    post?: OperationObject;
    delete?: OperationObject;
    options?: OperationObject;
    head?: OperationObject;
    patch?: OperationObject;
    trace?: OperationObject;
    servers?: ServerObject[];
    parameters?: ParameterObject[];
  }

  export interface SecuritySchemesObject {
    [securityScheme: string]: SecuritySchemeObject;
  }

  export interface OperationObject {
    operationId: string;
    parameters?: ParameterObject[];
    requestBody?: RequestBodyObject;
    responses: { [responseStatus: string]: ResponseObject };
    security?: SecurityRequirementObject[];
    __originalOperationId?: string
  }

  interface RequestBodyObject {
    description?: string;
    required?: boolean;
    content: { [name: string]: MediaTypeObject };
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

  export interface ResponseObject {
    description: string;
    headers?: { [headerName: string]: HeaderObject };
    content: { [contentType: string]: MediaTypeObject };
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
    example?: Json;
  }
  export interface SecuritySchemeObject {
    type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
    bearerFormat?: string;
  }

  interface SecurityRequirementObject {
    [security: string]: string[];
  }
}
