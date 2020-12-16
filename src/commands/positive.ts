import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import OasSchema, { ParameterExamples } from '../utilities/oas-schema';
import { Response } from 'swagger-client';
import OasValidator from '../utilities/oas-validator';
import { DEFAULT_PARAMETER_GROUP } from '../utilities/constants';

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
      [operationId: string]: {
        [parameterGroupName: string]: {
          response: Response;
          validationError?: Error;
        };
      };
    } = {};

    await Promise.all(
      operationIds.map((operationId) =>
        validator
          .validateParameters(operationId, operationIdToParameters[operationId])
          .catch((error) => {
            operationIdToResponseAndValidation[operationId] = {
              response: null,
              validationError: error,
            };
          }),
      ),
    );

    await Promise.all(
      operationIds
        .filter(
          (operationId) =>
            !operationIdToResponseAndValidation[operationId]?.validationError,
        )
        .flatMap((operationId) => {
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

                if (!operationIdToResponseAndValidation[operationId]) {
                  operationIdToResponseAndValidation[operationId] = {};
                }

                operationIdToResponseAndValidation[operationId][groupName] = {
                  response,
                };
              });
            });
          }

          return this.executeRequest(
            operationParameters,
            schema,
            operationId,
          ).then((response) => {
            if (!operationIdToResponseAndValidation[operationId]) {
              operationIdToResponseAndValidation[operationId] = {};
            }

            operationIdToResponseAndValidation[operationId][
              DEFAULT_PARAMETER_GROUP
            ] = { response };
          });
        }),
    );

    await Promise.all(
      Object.entries(operationIdToResponseAndValidation).map(
        ([operationId, parameterGroups]) => {
          return Promise.all(
            Object.entries(parameterGroups).map(
              ([parameterGroupName, { response }]) => {
                return validator
                  .validateResponse(operationId, response)
                  .catch((error) => {
                    operationIdToResponseAndValidation[operationId][
                      parameterGroupName
                    ].validationError = error;
                  });
              },
            ),
          );
        },
      ),
    );

    const failingOperations: {
      response: Response;
      validationError?: Error;
    }[] = [];

    Object.entries(operationIdToResponseAndValidation).forEach(
      ([operationId, parameterGroups]) => {
        Object.entries(parameterGroups).forEach(
          ([parameterGroupName, { response, validationError }]) => {
            if (!validationError && response.ok) {
              this.log(
                `${operationId}${
                  parameterGroupName === DEFAULT_PARAMETER_GROUP
                    ? ''
                    : ` - ${parameterGroupName}`
                }: Succeeded`,
              );
            } else {
              failingOperations.push({ response, validationError });
              this.log(
                `${operationId}${
                  parameterGroupName === DEFAULT_PARAMETER_GROUP
                    ? ''
                    : ` - ${parameterGroupName}`
                }: Failed${
                  validationError ? ` - ${validationError.message}` : ''
                }`,
              );
            }
          },
        );
      },
    );

    if (failingOperations.length > 0) {
      this.error(
        `${failingOperations.length} operation${
          failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
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
