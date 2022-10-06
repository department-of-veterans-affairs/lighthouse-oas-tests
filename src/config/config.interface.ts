export interface Config {
  [name: string]: TestOptions;
}

export interface TestOptions {
  path: string;
  apiKey?: string;
  token?: string;
  server?: string;
  suiteIds?: string[];
}
