import Command from '@oclif/command';
import Positive from './positive';
import { Json } from 'swagger-client';
import { extname } from 'path';
import loadJsonFile from 'load-json-file';
import parseUrl from 'parse-url';
import { OASConfig } from './types';

export default class PositiveAll extends Command {
  static description =
    'Runs positive smoke tests for all Lighthouse APIs in config based on OAS';

  static args = [
    {
      name: 'path',
      required: true,
      description: 'Url or local file path containing the OpenAPI spec',
    },
  ];

  async run(): Promise<void> {
    const { args } = this.parse(PositiveAll);
    const path = parseUrl(args.path);
    let config;

    if (path.protocol === 'file') {
      config = await this.loadConfigFromFile(args.path);
    }
    const argObjects: OASConfig[] = Object.values(config);
    await Promise.all(
      argObjects.map(async (arg: OASConfig): Promise<string> => {
        const arr: string[] = [];
        arr.push(arg.path);
        if (arg.apiKey) {
          arr.push('-a', arg.apiKey);
        }
        if (arg.bearerToken) {
          arr.push('-b', arg.bearerToken);
        }
        if (arg.server) {
          arr.push('-s', arg.server);
        }
        return Positive.run(arr);
      }),
    );
  }

  loadConfigFromFile = async (path): Promise<Json> => {
    let spec;
    const extension = extname(path);

    if (extension === '.json') {
      try {
        spec = await loadJsonFile(path);
        return spec;
      } catch (error) {
        return this.error('unable to load json file');
      }
    } else {
      this.error('Only file type .json is supported.');
    }
  };
}
