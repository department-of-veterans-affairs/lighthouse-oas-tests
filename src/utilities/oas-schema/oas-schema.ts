import swaggerClient, { Method, Response, Swagger } from 'swagger-client';
import uniq from 'lodash.uniq';
import {
  ParameterExamples,
  WrappedParameterExamples,
} from '../parameter-wrapper/types';
import ParameterWrapper from '../parameter-wrapper';
import { OasOperations, OasParameters } from './types';

class OASSchema {
  private _client: Promise<Swagger>;

  private operations: OasOperations = {};

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  execute = async (
    operationId: string,
    parameters: ParameterExamples,
  ): Promise<Response> => {
    const schema = await this._client;

    return schema
      .execute({
        operationId,
        parameters,
      })
      .catch((error) => {
        return error.response;
      });
  };

  // Retrieves parameter name and example values for each operationId in the OAS.
  getParameters = async (): Promise<OasParameters> => {
    const schema = await this._client;

    const methods = Object.values(schema.spec.paths).flatMap((path) =>
      Object.values(path),
    );

    // transforms each OAS method into a tuple that contains the operation id and an object containing parameter names and example values
    // e.g. [ 'findFormByFormName', { form_name: 'VA10192' } ]
    const operationIdToParameters = methods.map((method) => {
      // transforms each OAS parameter into a tuple that contains the parameter name and example value
      // e.g. [form_name: 'VA10192']
      const requiredParametersAndExamples = method.parameters
        .filter((parameter) => parameter.required)
        .map((parameter) => {
          const { name, example } = parameter;
          return [name, example];
        });

      const exampleGroups: string[] = uniq(
        method.parameters
          .filter((parameter) => parameter.examples)
          .flatMap((parameter) => Object.keys(parameter.examples)),
      );

      let parameters: WrappedParameterExamples | WrappedParameterExamples[];

      // If example groups are present, create a parameter set for each one merged with the base parameters
      if (exampleGroups.length > 0) {
        parameters = exampleGroups.map((groupName) => {
          const groupParameters = method.parameters
            .filter(
              (parameter) =>
                parameter.examples && parameter.examples[groupName],
            )
            .map((parameter) => {
              const { name, examples } = parameter;
              return [name, examples[groupName]];
            });

          return ParameterWrapper.wrapParameters(
            Object.assign(
              {},
              Object.fromEntries(requiredParametersAndExamples),
              Object.fromEntries(groupParameters),
            ),
            groupName,
          );
        });
      } else {
        parameters = ParameterWrapper.wrapParameters(
          Object.fromEntries(requiredParametersAndExamples),
        );
      }

      return [method.operationId, parameters];
    });

    return Object.fromEntries(operationIdToParameters);
  };

  getOperationIds = async (): Promise<string[]> => {
    const operations = await this.getOperations();
    return Object.keys(operations);
  };

  getOperations = async (): Promise<OasOperations> => {
    const schema = await this._client;
    if (Object.keys(this.operations).length === 0) {
      this.operations = Object.fromEntries(
        Object.values(schema.spec.paths).flatMap((path) => {
          return Object.values(path).map((method) => {
            return [method.operationId, method];
          });
        }),
      );
    }
    return this.operations;
  };

  getOperation = async (operationId: string): Promise<Method | null> => {
    const operations = await this.getOperations();

    return operations[operationId] || null;
  };
}

export default OASSchema;
