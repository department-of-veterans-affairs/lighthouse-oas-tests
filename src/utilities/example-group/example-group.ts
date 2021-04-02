import OASOperation from '../oas-operation';
import { ParameterExamples } from './types';

class ExampleGroup {
  readonly operation: OASOperation;

  readonly name: string;

  readonly examples: ParameterExamples;

  constructor(
    operation: OASOperation,
    name: string,
    examples: ParameterExamples,
  ) {
    this.operation = operation;
    this.name = name;
    this.examples = examples;
  }
}

export default ExampleGroup;
