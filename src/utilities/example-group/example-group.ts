import { ParameterExamples } from './types';

class ExampleGroup {
  readonly name: string;

  readonly examples: ParameterExamples;

  constructor(name: string, examples: ParameterExamples) {
    this.name = name;
    this.examples = examples;
  }
}

export default ExampleGroup;
