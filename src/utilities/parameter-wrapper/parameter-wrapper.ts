import { ParameterExamples, WrappedParameterExamples } from './types';
import { DEFAULT_PARAMETER_GROUP } from '../constants';

const wrapParameters = (
  parameters: ParameterExamples,
  groupName = DEFAULT_PARAMETER_GROUP,
): WrappedParameterExamples => {
  const wrappedParameters: WrappedParameterExamples = {};
  wrappedParameters[groupName] = parameters;

  return wrappedParameters;
};

const unwrapParameters = (
  wrappedParameters: WrappedParameterExamples,
): ParameterExamples => {
  if (Object.keys(wrappedParameters).length !== 1) {
    throw new TypeError(
      `Unexpected parameters format: ${JSON.stringify(wrappedParameters)}`,
    );
  }
  return Object.values(wrappedParameters)[0];
};

export default {
  wrapParameters,
  unwrapParameters,
};
