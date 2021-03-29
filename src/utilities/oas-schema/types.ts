import { WrappedParameterExamples } from '../parameter-wrapper/types';

export type OasParameters = {
  [operationId: string]: WrappedParameterExamples | WrappedParameterExamples[];
};
