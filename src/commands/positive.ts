import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import OasSchema from '../utilities/oas-schema';

export default class Positive extends ApiKeyCommand {
  static description =
    'Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs';

  static flags = {
    ...ApiKeyCommand.flags,
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
    const oasSchemaOptions: ConstructorParameters<typeof OasSchema>[0] = {
      authorizations: { apikey: { value: this.apiKey } },
    };

    if (flags.file) {
      try {
        const json = await loadJsonFile(args.path);
        oasSchemaOptions.spec = json;
      } catch (error) {
        this.error('unable to load json file', { exit: 2 });
      }
    } else {
      oasSchemaOptions.url = args.path;
    }

    const schema = new OasSchema(oasSchemaOptions);

    const operationIdToParameters = await schema.getParameters();
    const operationIds = await schema.getOperationIds();

    const responses = await Promise.all(
      operationIds.map((operationId) =>
        schema.execute(operationId, operationIdToParameters[operationId]),
      ),
    );

    const responsesValid = await Promise.all(
      responses.map((response, index) =>
        schema.validateResponse(operationIds[index], response),
      ),
    );
    responsesValid.forEach((responseIsValid, index) => {
      const response = responses[index];
      if (responseIsValid && response.ok) {
        this.log(`${response.url}: Succeeded`);
      } else {
        this.log(`${response.url}: Failed`);
      }
    });
  }
}
