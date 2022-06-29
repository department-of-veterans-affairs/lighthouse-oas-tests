import { OASSecurityType } from '../oas-security';

export type StructuredOutput = {
  id: string;
  config: TestConfig;
  error?: string;
  results?: ApiResults;
};

export interface TestConfig {
  oasPath: string;
  server: string;
  authenticationType: OASSecurityType[];
}

export interface ApiResults {
  apiSummary: ApiSummary;

  // a collection of endpoint results whose key is the operation ID
  [key: string]: EndpointResult | ApiSummary;
}

export interface ApiSummary {
  totalPass: number;
  totalWarn: number;
  totalFail: number;
  totalRun: number;
  runDateTime: Date;
}

export type EndpointResult = {
  endpointSummary: EndpointSummary;

  // a collection of example group results whose key is the example group name
  [key: string]: ExampleGroupResult | EndpointSummary;
};

export interface EndpointSummary {
  totalPass: number;
  totalWarn: number;
  totalFail: number;
  totalRun: number;
}

export interface ExampleGroupResult {
  errors: Array<ExampleGroupError>;
  warnings: Array<ExampleGroupWarning>;
}

export interface ExampleGroupError {
  message: string;
  count: number;
}

export interface ExampleGroupWarning {
  message: string;
  count: number;
}
