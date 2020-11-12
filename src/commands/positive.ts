import { Command, flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import resolve from 'swagger-client';

export default class Positive extends Command {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static examples = [
    `$ loast hello
hello world from ./src/hello.ts!
`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({ char: 'a', description: 'API key to use' }),
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

    const apiKey = flags.apiKey ?? process.env.API_KEY;

    if (!apiKey) {
      this.error(
        'apiKey flag should be provided or the API_KEY environment variable should be set',
        { exit: 2 },
      );
    }

    const swaggerClientOptions: Parameters<typeof resolve>[0] = {
      securities: { authorized: { apikey: { value: apiKey } } },
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

    const schema = await resolve(swaggerClientOptions);

    Object.values(schema.apis).forEach((value) => {
      Object.keys(value).forEach((operation) => {
        this.log(operation);
      });
    });
  }
}
