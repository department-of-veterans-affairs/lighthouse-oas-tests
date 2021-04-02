import { OperationObject, PathsObject } from 'swagger-client';
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
  public static buildFromPaths(paths: PathsObject): OASOperation[] {
    const pathObjects = Object.values(paths);

    const operationObjects = pathObjects.flatMap((path) => {
      return Object.entries(path).reduce<OperationObject[]>(
        (operations, [key, object]) =>
          OPERATION_KEYS.includes(key) ? [...operations, object] : operations,
        [],
      );
    });

    return operationObjects.map((operation) => new OASOperation(operation));
  }
}

export default OASOperationFactory;
