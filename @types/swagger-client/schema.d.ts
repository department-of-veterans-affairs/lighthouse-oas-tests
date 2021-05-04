declare module 'swagger-client/schema' {
  type Json = ReturnType<JSON['parse']>;

  interface OpenAPIObject {
    paths: PathsObject;
    components?: ComponentsObject;
    security?: SecurityRequirementObject[];
  }

  export interface PathsObject { [path: string]: PathItemObject }

  interface ComponentsObject {
    securitySchemes: SecuritySchemesObject;
  }

  interface SecurityRequirementObject { [security: string]: string[] }

  export interface SecuritySchemesObject { [securityScheme: string]: SecuritySchemeItemObject }

  export interface OperationObject {
    operationId: string;
    parameters: ParameterObject[];
    responses: { [responseStatus: string]: ResponseObject };
    security?: SecurityRequirementObject[];
  }
  interface PathItemObject {
    get?: OperationObject;
    post?: OperationObject;
    put?: OperationObject;
    delete?: OperationObject;
    patch?: OperationObject;
  }

  interface SecuritySchemeItemObject {
    type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string;
    in?: 'query' | 'header' | 'cookie';
    scheme?: string;
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
