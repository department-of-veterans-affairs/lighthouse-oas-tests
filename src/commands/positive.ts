import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import OasSchema from '../utilities/oas-schema';
import { Response } from 'swagger-client';
import OasValidator from '../utilities/oas-validator';

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
        this.error('unable to load json file');
      }
    } else {
      oasSchemaOptions.url = args.path;
    }

    const schema = new OasSchema(oasSchemaOptions);
    const validator = new OasValidator(schema);

    const operationIdToParameters = await schema.getParameters();
    const operationIds = await schema.getOperationIds();

    const operationIdToResponseAndValidation: {
      [operationId: string]: { response: Response; validationError?: Error };
    } = {};

    await Promise.all(
      operationIds.flatMap((operationId) => {
        const operationParameters = operationIdToParameters[operationId];

        // If multiple parameter sets are present (due to example groups), execute once for each
        if (Array.isArray(operationParameters)) {
          return operationParameters.map((parameters) =>
            schema.execute(operationId, parameters).then((response) => {
              operationIdToResponseAndValidation[operationId] = { response };
            }),
          );
        }
        return schema
          .execute(operationId, operationParameters)
          .then((response) => {
            operationIdToResponseAndValidation[operationId] = { response };
          });
      }),
    );

    await Promise.all(
      Object.entries(operationIdToResponseAndValidation).map(
        ([operationId, { response }]) => {
          return validator
            .validateResponse(operationId, response)
            .catch((error) => {
              operationIdToResponseAndValidation[
                operationId
              ].validationError = error;
            });
        },
      ),
    );

    Object.entries(operationIdToResponseAndValidation).forEach(
      ([operationId, { response, validationError }]) => {
        if (!validationError && response.ok) {
          this.log(`${operationId}: Succeeded`);
        } else {
          this.log(
            `${operationId}: Failed${
              validationError ? ` ${validationError.message}` : ''
            }`,
          );
        }
      },
    );

    const failingOperations = Object.values(
      operationIdToResponseAndValidation,
    ).filter(({ validationError }) => validationError);

    if (failingOperations.length > 0) {
      this.error(
        `${failingOperations.length} operation${
          failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
  }
}
