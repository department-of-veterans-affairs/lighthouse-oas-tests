import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import swaggerClient from 'swagger-client';
import BaseCommand from '../baseCommands/base';

export default class Positive extends BaseCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static examples = [
    `$ loast hello
hello world from ./src/hello.ts!
`,
  ];

  static flags = {
    ...BaseCommand.flags,
    file: flags.boolean({
      char: 'f',
      description: 'Provide this flag if the path is to a local file',
    }),
  };

  static args = [
    {
      name: 'path',
      required: true,
      description: 'Url or local file path containing the OpenAPI spec',
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = this.parse(Positive);

    const swaggerClientOptions: Parameters<typeof swaggerClient>[0] = {
      securities: { authorized: { apikey: { value: this.apiKey } } },
    };

    if (flags.file) {
      try {
        const json = await loadJsonFile(args.path);
        swaggerClientOptions.spec = json;
      } catch (error) {
        this.error('unable to load json file', { exit: 2 });
      }
    } else {
      swaggerClientOptions.url = args.path;
    }

    // ignoring this eslint rule because this is the only way to access SwaggerClient
    //    const schema = await SwaggerClient(swaggerClientOptions); // eslint-disable-line new-cap

    const schema = await swaggerClient(swaggerClientOptions);

    Object.values(schema.apis).forEach((value) => {
      Object.keys(value).forEach((operation) => {
        this.log(operation);
      });
    });
  }
}
