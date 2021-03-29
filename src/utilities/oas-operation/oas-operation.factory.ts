import { Operation, PathObject } from 'swagger-client';
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
  public static buildFromPaths(paths: PathObject): OASOperation[] {
    const pathObjects = Object.values(paths);
    const operationObjects = pathObjects.flatMap((path) => {
      return Object.entries(path).reduce<Operation[]>(
        (operations, [key, object]) => {
          if (OPERATION_KEYS.includes(key)) {
            operations = [...operations, object];
          }
          return operations;
        },
        [],
      );
    });

    return operationObjects.map((operation) => new OASOperation(operation));
  }
}

export default OASOperationFactory;
