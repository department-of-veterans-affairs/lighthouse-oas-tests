import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import swaggerClient from 'swagger-client';
import BaseCommand from '../baseCommands/base';
import initializeSwaggerClient, { execute } from '../utilities/swagger-utils';
import getParameters from '../utilities/utilities';

export default class Positive extends BaseCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

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
      authorizations: { apikey: { value: this.apiKey } },
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

    const schema = await initializeSwaggerClient(swaggerClientOptions);

    const operationIdToParameters: {
      [operationId: string]: { [name: string]: string };
    } = getParameters(schema);

    const responses = await Promise.all(
      Object.values(schema.apis).flatMap((api) => {
        return Object.keys(api).map((operationId) => {
          return execute(
            schema,
            operationId,
            operationIdToParameters[operationId],
          );
        });
      }),
    );

    responses.forEach((response) => {
      if (response) {
        this.log(response.url);
        this.log(response.status.toString());
        this.log(response.ok.toString());
      }
    });
  }
}
