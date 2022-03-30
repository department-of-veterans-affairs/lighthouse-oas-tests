import Command, { flags } from '@oclif/command';
import Positive from './positive';
import { Json } from 'swagger-client';
import { extname } from 'path';
import loadJsonFile from 'load-json-file';
import parseUrl from 'parse-url';
import { OASConfig } from './types';

export default class PositiveAll extends Command {
  static description =
    'Runs positive smoke tests for all Lighthouse APIs in config based on OAS';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

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
    const oasConfigs: OASConfig[] = Object.values(config);
    await Promise.all(
      oasConfigs.map(async (oasConfig: OASConfig): Promise<void> => {
        return Positive.run(this.convertConfigObjectsToArray(oasConfig));
      }),
    );
  }

  convertConfigObjectsToArray = (oasConfig: OASConfig): string[] => {
    const arr: string[] = [oasConfig.path, '-n'];
    if (oasConfig.apiKey) {
      arr.push('-a', oasConfig.apiKey);
    }
    if (oasConfig.bearerToken) {
      arr.push('-b', oasConfig.bearerToken);
    }
    if (oasConfig.server) {
      arr.push('-s', oasConfig.server);
    }
    return arr;
  };

  loadConfigFromFile = async (path): Promise<Json> => {
    let spec;
    const extension = extname(path);

    if (extension === '.json') {
      try {
        spec = await loadJsonFile(path);
        return spec;
      } catch (error) {
        return this.error('Unable to load json file');
      }
    } else {
      this.error('Only file type .json is supported.');
    }
  };
}
