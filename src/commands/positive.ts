import { flags } from '@oclif/command';
import loadJsonFile from 'load-json-file';
import { ApiKeyCommand } from '../baseCommands';
import { Response } from 'swagger-client';
import OasSchema, { OasParameters } from '../utilities/oas-schema';
import OasValidator from '../utilities/oas-validator';
import { DEFAULT_PARAMETER_GROUP } from '../utilities/constants';
import { WrappedParameterExamples } from '../types/parameter-examples';
import ParameterWrapper from '../utilities/parameter-wrapper';

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

  // All of these will be overwritten in the run command
  private schema: OasSchema = new OasSchema({});

  private validator: OasValidator = new OasValidator(this.schema);

  private operationIds: string[] = [];

  private operationIdToParameters: OasParameters = {};

  private operationIdToResponseAndValidation: {
    [operationId: string]: {
      [parameterGroupName: string]: {
        response?: Response;
        validationError?: Error;
      };
    };
  } = {};

  private failingOperations: {
    response?: Response;
    validationError?: Error;
  }[] = [];

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

    this.schema = new OasSchema(oasSchemaOptions);
    this.validator = new OasValidator(this.schema);

    this.operationIdToParameters = await this.schema.getParameters();
    this.operationIds = await this.schema.getOperationIds();

    await Promise.all(this.validateParameters());

    await Promise.all(this.executeRequests());

    await Promise.all(this.validateResponses());

    this.displayResults();
  }

  validateParameters = (): Promise<void>[] => {
    return this.operationIds.flatMap((operationId) => {
      const parameters = this.operationIdToParameters[operationId];

      if (Array.isArray(parameters)) {
        return parameters.map((parameterGroup) => {
          return this.validator
            .validateParameters(operationId, parameterGroup)
            .catch((error) => {
              this.operationIdToResponseAndValidation[operationId] = {};
              this.operationIdToResponseAndValidation[operationId][
                Object.keys(parameterGroup)[0]
              ] = {
                validationError: error,
              };
            });
        });
      }
      return this.validator
        .validateParameters(operationId, parameters)
        .catch((error) => {
          this.operationIdToResponseAndValidation[operationId] = {};
          this.operationIdToResponseAndValidation[operationId][
            DEFAULT_PARAMETER_GROUP
          ] = {
            validationError: error,
          };
        });
    });
  };

  validateResponses = (): Promise<void>[] => {
    return Object.entries(this.operationIdToResponseAndValidation).flatMap(
      ([operationId, parameterGroups]) => {
        return Object.entries(parameterGroups)
          .filter(
            // This is a bit of wacky typescript to get the following functions to recognize response won't be undefined any more
            (operation): operation is [string, { response: Response }] =>
              operation[1].response !== undefined,
          )
          .map(([parameterGroupName, { response }]) => {
            return this.validator
              .validateResponse(operationId, response)
              .catch((error) => {
                this.operationIdToResponseAndValidation[operationId][
                  parameterGroupName
                ].validationError = error;
              });
          });
      },
    );
  };

  executeRequests = (): Promise<void>[] =>
    this.operationIds
      .filter((operationId) => {
        // filter out all the requests that failed parameter validation
        const existingValidations = this.operationIdToResponseAndValidation[
          operationId
        ];

        return (
          !existingValidations ||
          (existingValidations[DEFAULT_PARAMETER_GROUP] &&
            !existingValidations[DEFAULT_PARAMETER_GROUP].validationError)
        );
      })
      .flatMap((operationId) => {
        const operationParameters = this.operationIdToParameters[operationId];

        // If multiple parameter sets are present (due to example groups), execute once for each
        if (Array.isArray(operationParameters)) {
          return operationParameters
            .filter((parameterExamples) => {
              const groupName = Object.keys(parameterExamples)[0];
              const existingValidations = this
                .operationIdToResponseAndValidation[operationId];

              return (
                !existingValidations ||
                (existingValidations[groupName] &&
                  !existingValidations[groupName].validationError)
              );
            })
            .map((parameterExamples) => {
              return this.executeRequest(parameterExamples, operationId).then(
                (response) => {
                  const groupName = Object.keys(parameterExamples)[0];

                  if (!this.operationIdToResponseAndValidation[operationId]) {
                    this.operationIdToResponseAndValidation[operationId] = {};
                  }

                  this.operationIdToResponseAndValidation[operationId][
                    groupName
                  ] = {
                    response,
                  };
                },
              );
            });
        }

        return this.executeRequest(operationParameters, operationId).then(
          (response) => {
            if (!this.operationIdToResponseAndValidation[operationId]) {
              this.operationIdToResponseAndValidation[operationId] = {};
            }

            this.operationIdToResponseAndValidation[operationId][
              DEFAULT_PARAMETER_GROUP
            ] = { response };
          },
        );
      });

  executeRequest = (
    parameterExamples: WrappedParameterExamples,
    operationId: string,
  ): Promise<Response> => {
    const unwrappedParameters = ParameterWrapper.unwrapParameters(
      parameterExamples,
    );
    return this.schema.execute(operationId, unwrappedParameters);
  };

  displayResults = (): void => {
    Object.entries(this.operationIdToResponseAndValidation).forEach(
      ([operationId, parameterGroups]) => {
        Object.entries(parameterGroups).forEach(
          ([parameterGroupName, { response, validationError }]) => {
            if (!validationError && response?.ok) {
              this.log(
                `${operationId}${
                  parameterGroupName === DEFAULT_PARAMETER_GROUP
                    ? ''
                    : ` - ${parameterGroupName}`
                }: Succeeded`,
              );
            } else {
              this.failingOperations.push({ response, validationError });
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

    if (this.failingOperations.length > 0) {
      this.error(
        `${this.failingOperations.length} operation${
          this.failingOperations.length > 1 ? 's' : ''
        } failed`,
      );
    }
  };
}
