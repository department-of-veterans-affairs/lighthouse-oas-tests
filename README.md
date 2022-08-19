![Logo](images/loast-logo.png)

# LOAST

CLI for testing Lighthouse APIs using OpenAPI specs

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/loast.svg)](https://npmjs.org/package/loast)
[![Downloads/week](https://img.shields.io/npm/dw/loast.svg)](https://npmjs.org/package/loast)
[![License](https://img.shields.io/npm/l/loast.svg)](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/package.json)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- toc -->

- [LOAST](#loast)
- [Usage](#usage)
- [Commands](#commands)
- [OpenApi Spec Setup](#openapi-spec-setup)
- [Validation Failures](#validation-failures)
- [Local Development](#local-development)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g loast
$ loast COMMAND
running command...
$ loast (-v|--version|version)
loast/0.0.0-development darwin-x64 node-v14.15.1
$ loast --help [COMMAND]
USAGE
  $ loast COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`loast help [COMMAND]`](#loast-help-command)
- [`loast suites PATH`](#loast-suites-path)
- [`loast suites-batch PATH`](#loast-suites-batch-path)

## `loast help [COMMAND]`

display help for loast

```
USAGE
  $ loast help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `loast suites PATH`

Runs happy-path tests for an API based on the OpenAPI spec

```
USAGE
  $ loast suites PATH

ARGUMENTS
  PATH  Url or local file path containing the OpenAPI spec

OPTIONS
  -a, --apiKey=apiKey            API key to use
  -b, --bearerToken=bearerToken  Bearer token to use
  -h, --help                     Show CLI help
  -s, --server=server            Server URL to use
  -j, --jsonOutput               Format output as JSON
```

_See code: [src/commands/suites.ts](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/src/commands/suites.ts)_

## `loast suites-batch PATH`

Runs happy-path tests for all APIs in the config file based on their OpenAPI specs

```
USAGE
  $ loast suites-batch PATH

ARGUMENTS
  PATH  Local file path for the JSON config file. See example file at
        https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/batch-configs/example-batch-config.json

OPTIONS
  -h, --help  Show CLI help
```

_See code: [src/commands/suites-batch.ts](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/src/commands/suites-batch.ts)_

<!-- commandsstop -->

# OpenApi Spec Setup

## Example Groups

If your endpoint supports different groupings of parameters (such as taking either an address or a set of positional coordinates), you can use the `examples` field on the `Parameter` object to create groupings.
Create an `examples` object on each parameter that needs to go into a group in the form:

```json
"examples": {
  "group name": {
    "value": "example value"
  }
}
```

`loast` will go through and execute a test against the endpoint for each grouping it finds, including any required parameters in each request.

## Parameter Groups

Example Groups are built from Parameter objects in both the Path Item Object and the Operation Object.

- Parameters set at the Path Item Object level with an example (or examples), Will be included in the example groups for any Operation Objects underneath the Path Item
  <details><summary>Sample JSON</summary>

  ```json
  "paths": {
    "/sample": {
        "get": {
          "tags": [
            "facilities"
          ],
          "operationId": "getPathAndOp",
          "parameters": [
            {
                "name": "lat",
                "in": "query",
                "description": "Latitude of the location from which drive time will be calculated.",
                "schema": {
                    "type": "number",
                    "format": "float"
                },
                "examples": {
                    "coordinates": {
                        "value": 123.4
                    }
                }
            },
            {
                "name": "lng",
                "in": "query",
                "description": "Longitude of the location from which drive time will be calculated.",
                "style": "form",
                "schema": {
                    "type": "number",
                    "format": "float"
                },
                "examples": {
                    "coordinates": {
                        "value": 456.7
                    }
                }
            },
            {
              "name": "page",
              "in": "query",
              "description": "Page of results to return per paginated response.",
              "schema": {
                "type": "integer",
                "format": "int32",
                "default": 1
              },
              "example": 1,
              "required": true
            }
          ]
        },
        "parameters": [
          {
            "name": "per_page",
            "in": "query",
            "description": "Number of results to return per paginated response.",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            },
            "example": 20,
            "required": true
          }
        ]
    }
  }

  //Example Group
  {
    "name": "coordinates",
    "examples": {
      "page": 1,
      "per_page": 20,
      "lat": 123.4,
      "lng": 456.7
    }
  },
  {
    "name": "default",
    "examples": {
      "page": 1,
      "per_page": 20
    }
  }
  ```

  </details>
  </br>

- When the parameters set at the Operation Object level have the same unique identifier (combination of name and in values) as the Path Item Object parameters the example is pulled from the Operation Object level.

  <details><summary>Sample JSON</summary>

  ```json
    "paths": {
      "/sample": {
          "get": {
            "tags": [
              "facilities"
            ],
            "operationId": "getSameValues",
            "parameters": [
              {
                "name": "page",
                "in": "query",
                "description": "Page of results to return per paginated response.",
                "schema": {
                  "type": "integer",
                  "format": "int32",
                  "default": 1
                },
                "example": 1,
                "required": true
              }
            ]
          },
          "parameters": [
            {
              "name": "page",
              "in": "query",
              "description": "Number of results to return per paginated response.",
              "schema": {
                "type": "integer",
                "format": "int32",
                "default": 20
              },
              "example": 20,
              "required": true
            }
          ]
      }
    }

    //Example Group
    {
      "name": "default",
      "examples": {
        "page": 1
      }
    }
  ```

  </details>
  </br>

- Using an empty default example group may result in false failures if the endpoint under test responds with an error if no parameters are provided.

  <details><summary>Sample JSON</summary>

  ```sh
  getSampleEmptyGroup - default: Failed
    - Response status code was a non 2XX value
  ```

  </details>

## Example Request Body

An Example Request Body is built from Property objects in the Request Body's Content schema.
All properties listed as required will be included in the example request body.
Properties that are not required will not be included, even if a property example is provided.

<details><summary>Sample JSON</summary>

```json
  "schemas": {
    "VeteranStatusRequest": {
      "type": "object",
      "required": [
        "ssn",
        "first_name",
        "last_name",
        "birth_date"
      ],
      "properties": {
        "ssn": {
          "type": "string",
          "example": "555-55-5555"
        },
        "first_name": {
          "type": "string",
          "example": "John"
        },
        "last_name": {
          "type": "string",
          "example": "Doe"
        },
        "birth_date": {
          "type": "string",
          "example": "1965-01-01"
        },
        "middle_name": {
          "type": "string",
          "example": "Theodore"
        },
        "gender": {
          "type": "string",
          "enum": [
            "M",
            "F"
          ],
          "example": "M"
        }
      }
    }
  }

  //Example Request Body
  {
    "ssn": "555-55-5555",
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "1965-01-01"
  }
```

</details>

# Validation Failures

The sections below contain details about validation failures that can be produced by loast and how to fix them. Failures will include a path to the place in the schema where the failure occured.

## Parameter Validation Failures

If a parameter validation failure occurs the suites command will not attempt to send a request that includes the parameter that failed.
Parameter validation failures include the following as well as the schema failures listed below.

| Failure                       | Description                                                                                     | Fix                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Missing required parameters   | No example is provided for a parameter marked as required                                       | Add examples for all required parameters or remove the required flag if the parameter is not required     |
| Invalid parameter object      | The parameter object does not contain either a schema or content field, or contains both fields | Add either a schema or content field to the parameter, but not both                                       |
| Invalid parameter content     | The parameter object's content field contains zero or more than one keys                        | Ensure the content field contains only one key specifying the media type                                  |
| Missing content schema object | A valid schema object is missing from the media object in the content field                     | Add the missing schema object to the media type object associated with the content field of the parameter |

## Request Body Validation Failures

If a request body validation failure occurs the suites command will not attempt to send a request that includes the request body that failed.
Request body validation failures include the following as well as the schema failures listed below.

| Failure                      | Description                                                                 | Fix                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Invalid request body content | The request body object's content field contains zero or more than one keys | Ensure the content field contains only one key specifying the media type |

## Response Validation Failures

If one of these validation failures occur the rest of the response will not be validated.

| Failure               | Description                                                        | Fix                          |
| --------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Status code mismatch  | Actual response has a status code that is not included in the OAS  | Add the missing status code  |
| Content type mismatch | Actual response has a content type that is not included in the OAS | Add the missing content type |

## Schema Validation Failures

These failures can occur for parameters and responses.

| Failure                    | Description                                                                | Fix                                                                                           |
| -------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Null value not allowed     | Actual object is null, but the schema does not allow null values           | If null values should be allowed for this object set the nullable field to true in the schema |
| Type mismatch              | Actual object type does not match type defined in the schema               | Update the schema to correctly set the type                                                   |
| Duplicate enum values      | Schema enum contains duplicate values                                      | Remove duplicate values from the enum                                                         |
| Enum mismatch              | Actual object does not match a value in the schema enum                    | Update the enum to contain all valid values                                                   |
| Missing `items` field      | Schemas for arrays must include the `items` field                          | Set the `items` field on array schemas                                                        |
| Missing `properties` field | Schemas for objects must include the `properties` field                    | Set the `properties` field on object schemas                                                  |
| Properties mismatch        | Actual object contains properties not present in the schema                | Update the schema so all valid properties are included                                        |
| Missing required property  | Actual object does not contain a property marked as required in the schema | Update the schema so that only required properties are marked as required                     |
| Invalid `operationId`      | There is no operation with that id                                         | Check for misspellings or add the missing `operationId` to the schema                         |

# Local Development

See our [contribution guide](CONTRIBUTING.MD)

## Running Commands

Before running any commands locally and after any code changes, the code will need to be built using `npm run build`.
While developing locally, `$ ./bin/run` is the equivalent of running `$ loast` with the CLI installed.

- e.g.: `$ ./bin/run suites -a YOUR_API_KEY -s https://sandbox-api.va.gov/services/va_facilities/{version} test/fixtures/facilities_oas.json` will run suites tests against the facilities OAS present in our test fixtures.

## Testing

Tests are setup with [Jest](https://jestjs.io/). Run tests using the `npm run test` command.

## Linting

This library is setup with [eslint](https://eslint.org/) and [Prettier](https://prettier.io/). Run linting using the `npm run lint` command or the `npm run lint:fix` command for in place corrections of errors.

## Debugging

### With Visual Studio Code

This requires the [Docker Extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) to be installed.

Debugging with Visual Studio Code can be accomplished by adding or updating `./.vscode/launch.json` with the following configurations:

```shl
{
  "configurations": [
    {
      "name": "Launch Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/bin/run",
      "outputCapture": "std",
      "stopOnEntry": true,
      "args": [ // args are passed to the program being debugged
        "suites",
        "-a",
        "YOUR_API_KEY",
        "-s",
        "https://sandbox-api.va.gov/services/va_facilities/{version}"
        "test/fixtures/facilities_oas.json"
      ],
      "preLaunchTask": "npm: build"
    },
    {
      "name": "Attach",
      "port": 9229,
      "request": "attach",
      "type": "node"
    }
  ]
}
```

The `Launch Debug` configuration will build the application, launch it with the arguments defined under `args`, connect the debugger, and pause at the first line of code.
If it is preferred to execute the application until a breakpoint is hit, then change `stopOnEntry` to `false`.

The `Attach` configuration will attach the debugger to a loast instance that is already running. Loast can be launched for debugging like so:

`$ node --inspect-brk ./bin/run suites -a YOUR_API_KEY test/fixtures/facilities_oas.json -s https://sandbox-api.va.gov/services/va_facilities/{version}`

### With WebStorm

Debugging with WebStorm can be accomplished by creating a Node.js run/debug configuration as described [here](https://www.jetbrains.com/help/webstorm/running-and-debugging-node-js.html#Node.js_run).  
Set the **JavaScript File** field to: `bin/run`  
Set the **Application Parameters** field to: `suites -a YOUR_API_KEY test/fixtures/facilities_oas.json -s https://sandbox-api.va.gov/services/va_facilities/{version}`

To build the application automatically, configure a before-launch task of type **Run npm script**.  
Set the **Command** field to: `run`  
Set the **Scripts** field to: `build`

## Releasing

See [oclif's release documentation](https://oclif.io/docs/releasing) for instructions on how to release new versions of the CLI both to npm and as standalone packages

### Node Version Tools

- **NVM:** `.nvmrc` file is included in the repo to lock in the version of node used for development.

  - Run `nvm use` to change your version of node. You may need to run `nvm install` first if the required version isn't installed.
  - You can automatically call `nvm use` by updating your `$HOME/.bashrc` or `$HOME/.zshrc` more on that [here.](https://github.com/nvm-sh/nvm#nvmrc)

- **ASDF:** `.tool-versions` file is also included in the repo to lock in the version of node used for development.
  - Run `asdf install` to install the version of node in the `.tool-versions` file.
  - Additional settings and adding a `.asdfrc` to your home directory [here.](https://asdf-vm.com/#/core-configuration?id=homeasdfrc)
