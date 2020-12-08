import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import OasSchema, { ParameterExamples } from '../utilities/oas-schema';
import { Response } from 'swagger-client';
import OasValidator from '../utilities/oas-validator';
import { SEPERATOR } from '../utilities/constants';

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
    const validator = new OasValidator(schema);

    const operationIdToParameters = await schema.getParameters();
    const operationIds = await schema.getOperationIds();

    const operationIdToResponseAndValidation: {
      [id: string]: { response: Response; validationError?: Error };
    } = {};

    await Promise.all(
      operationIds.flatMap((operationId) => {
        const operationParameters = operationIdToParameters[operationId];

        // If multiple parameter sets are present (due to example groups), execute once for each
        if (Array.isArray(operationParameters)) {
          return operationParameters.map((parameterExamples) => {
            return this.executeRequest(
              parameterExamples,
              schema,
              operationId,
            ).then((response) => {
              const groupName = Object.keys(parameterExamples)[0];
              operationIdToResponseAndValidation[
                `${operationId}${SEPERATOR}${groupName}`
              ] = { response };
            });
          });
        }

        return this.executeRequest(
          operationParameters,
          schema,
          operationId,
        ).then((response) => {
          operationIdToResponseAndValidation[operationId] = { response };
        });
      }),
    );

    await Promise.all(
      Object.entries(operationIdToResponseAndValidation).map(
        ([operationIdAndGroupName, { response }]) => {
          const seperatorIndex = operationIdAndGroupName.indexOf(SEPERATOR);
          const operationId =
            seperatorIndex === -1
              ? operationIdAndGroupName
              : operationIdAndGroupName.slice(0, seperatorIndex);

          return validator
            .validateResponse(operationId, response)
            .catch((error) => {
              operationIdToResponseAndValidation[
                operationIdAndGroupName
              ].validationError = error;
            });
        },
      ),
    );

    Object.entries(operationIdToResponseAndValidation).forEach(
      ([id, { response, validationError }]) => {
        if (!validationError && response.ok) {
          this.log(`${id}: Succeeded`);
        } else {
          this.log(
            `${id}: Failed${
              validationError ? ` ${validationError.message}` : ''
            }`,
          );
        }
      },
    );
  }

  executeRequest = async (
    parameterExamples: ParameterExamples,
    schema: OasSchema,
    operationId: string,
  ): Promise<Response> => {
    if (Object.keys(parameterExamples).length !== 1) {
      throw new TypeError(
        `Unexpected parameters format: ${JSON.stringify(parameterExamples)}`,
      );
    }
    const parameters = Object.values(parameterExamples)[0];
    return schema.execute(operationId, parameters);
  };
}
