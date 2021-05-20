import { OperationObject, PathsObject } from 'swagger-client';
import {
  ParameterObject,
  SecurityRequirementObject,
} from 'swagger-client/schema';
import OASOperation from './oas-operation';

const OPERATION_KEYS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

class OASOperationFactory {
  public static buildFromPaths(
    paths: PathsObject,
    securities?: SecurityRequirementObject[],
  ): OASOperation[] {
    const pathObjects = Object.values(paths);
    let params: ParameterObject[] = [];
    const operationObjects = pathObjects.flatMap((path) => {
      return Object.entries(path).reduce<OperationObject[]>(
        (operations, [key, object]) => {
          if (key === 'parameters') params = [...object];
          return OPERATION_KEYS.includes(key)
            ? [...operations, object]
            : operations;
        },
        [],
      );
    });

    return operationObjects.map((operation) => {
      operation.parameters = [...params, ...operation.parameters];
      return new OASOperation(operation, securities);
    });
  }
}

export default OASOperationFactory;
