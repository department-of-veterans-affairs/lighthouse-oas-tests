import { Method } from 'swagger-client';
import { WrappedParameterExamples } from '../parameter-wrapper/types';

export type OasOperations = {
  [operationId: string]: Method;
};

export type OasParameters = {
  [operationId: string]: WrappedParameterExamples | WrappedParameterExamples[];
};
