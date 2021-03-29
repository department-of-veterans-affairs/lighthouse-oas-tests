import OASOperation from '../oas-operation';
import { ParameterExamples } from './types';

class ExampleGroup {
  private operation: OASOperation;

  private name: string;

  private examples: ParameterExamples;

  constructor(
    operation: OASOperation,
    name: string,
    examples: ParameterExamples,
  ) {
    this.operation = operation;
    this.name = name;
    this.examples = examples;
  }

  getName(): string {
    return this.name;
  }

  getExamples(): ParameterExamples {
    return this.examples;
  }

  getOperation(): OASOperation {
    return this.operation;
  }
}

export default ExampleGroup;
