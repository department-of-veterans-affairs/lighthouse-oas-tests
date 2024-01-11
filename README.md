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
- [Validation](#validation)
  - [Example Group Validation](#example-group-validation)
  - [Spectral Linting](#spectral-linting)
    - [Adding a new Spectral driven suite or ruleset](#adding-a-new-spectral-driven-suite-or-ruleset)
    - [Creating a custom rule](#creating-a-custom-rule)
    - [Jest testing custom rulesets](#jest-testing-custom-rulesets)
    - [Removing a Spectral driven suite](#removing-a-spectral-driven-suite)
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
  COMMAND  Command to show help for

OPTIONS
  --all  See all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `loast suites PATH`

Runs happy-path tests for an API based on the OpenAPI spec.

```
USAGE
  $ loast suites PATH

ARGUMENTS
  PATH  Url or local file path containing the OpenAPI spec

OPTIONS
  -a, --apiKey=apiKey            API key to use
  -b, --bearerToken=bearerToken  Bearer token to use
  -h, --help                     Show CLI help
  -i, --id=id                    Suite Ids to use
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
  -i, --id=id  Suite Ids to use
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

For example, an endpoint that accepts either an address or a set of positional coordinates, but not both, would look like this:

  <details><summary>Sample JSON</summary>

```json
"paths" : {
  "/Location" : {
    "get" : {
      "tags" : [
        "Location"
      ],
      "operationId" : "locationSearch",
      "parameters" : [
        {
          "name": "lat",
          "in": "query",
          "description": "Latitude of the location.",
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
          "description": "Longitude of the location.",
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
          "name" : "address",
          "in" : "query",
          "description" : "Indicates the physical location expressed using postal conventions.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "151 KNOLLCROFT ROAD"
            }
          }
        },
        {
          "name" : "address-city",
          "in" : "query",
          "description" : "Indicates the geographical city where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "LYONS"
            }
          }
        },
        {
          "name" : "address-state",
          "in" : "query",
          "description" : "Indicates the geographical state where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "NJ"
            }
          }
        },
        {
          "name" : "address-postalcode",
          "in" : "query",
          "description" : "Indicates the postal code that designates the region where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "07939"
            }
          }
        }
      ]
    }
  }
}

//Example Group
{
  "name": "coordinates",
  "examples": {
    "lat": 123.4,
    "lng": 456.7
  }
},
{
  "name": "address",
  "examples": {
    "address": "151 KNOLLCROFT ROAD",
    "address-city": "LYONS",
    "address-state": "NJ",
    "address-postalcode": "07939"
  }
},
{
  "name": "default",
  "examples": {}
}
```

  </details>

If the endpoint has no required parameters, but must be called with some combination of optional parameters, name one of the groups "default". Otherwise, `loast` will use a default group with no parameters.

  <details><summary>Sample JSON</summary>

```json
"paths" : {
  "/Location" : {
    "get" : {
      "tags" : [
        "Location"
      ],
      "operationId" : "locationSearch",
      "parameters" : [
        {
          "name": "lat",
          "in": "query",
          "description": "Latitude of the location.",
          "schema": {
            "type": "number",
            "format": "float"
          },
          "examples": {
            "default": {
              "value": 123.4
            }
          }
        },
        {
          "name": "lng",
          "in": "query",
          "description": "Longitude of the location.",
          "style": "form",
          "schema": {
            "type": "number",
            "format": "float"
          },
          "examples": {
            "default": {
              "value": 456.7
            }
          }
        },
        {
          "name" : "address",
          "in" : "query",
          "description" : "Indicates the physical location expressed using postal conventions.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "151 KNOLLCROFT ROAD"
            }
          }
        },
        {
          "name" : "address-city",
          "in" : "query",
          "description" : "Indicates the geographical city where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "LYONS"
            }
          }
        },
        {
          "name" : "address-state",
          "in" : "query",
          "description" : "Indicates the geographical state where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "NJ"
            }
          }
        },
        {
          "name" : "address-postalcode",
          "in" : "query",
          "description" : "Indicates the postal code that designates the region where the location resides.",
          "schema" : {
            "type" : "string"
          },
          "examples" : {
            "address" : {
              "value" : "07939"
            }
          }
        }
      ]
    }
  }
}

//Example Group
{
  "name": "default",
  "examples": {
    "lat": 123.4,
    "lng": 456.7
  }
},
{
  "name": "address",
  "examples": {
    "address": "151 KNOLLCROFT ROAD",
    "address-city": "LYONS",
    "address-state": "NJ",
    "address-postalcode": "07939"
  }
}
```

  </details>

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

## Example Request Bodies

If an Operation requires a request body, LOAST will build a default ExampleRequestBody using an OAS Operation source in order of precedence:

- MediaTypeObject.example
- The "example" field on each property in MediaTypeObject.schema.properties

The default ExampleRequestBody will include every field included in MediaTypeObject.example or every property in MediaTypeObject.schema.properties that has its "example" field set.

If the default ExampleRequestBody contains optional fields, then an additional required-fields-only ExampleRequestBody will be constructed. This request body will only contain fields that are marked as required in MediaTypeObject.schema.

<details><summary>Sample JSON - MediaTypeObject.example</summary>

```json
  "paths": {
    "/status": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "ssn",
                  "first_name",
                  "last_name",
                  "birth_date"
                ],
                "properties": {
                  "ssn": {
                    "type": "string"
                  },
                  "first_name": {
                    "type": "string"
                  },
                  "last_name": {
                    "type": "string"
                  },
                  "birth_date": {
                    "type": "string"
                  },
                  "middle_name": {
                    "type": "string"
                  },
                  "gender": {
                    "type": "string",
                    "enum": [
                      "M",
                      "F"
                    ]
                  }
                }
              },
              "example": {
                "ssn": "555-55-5555",
                "first_name": "John",
                "last_name": "Doe",
                "birth_date": "1965-01-01",
                "middle_name": "Theodore",
                "gender": "M"
              }
            }
          }
        }
      }
    }
  }

  //Example Request Body - default
  {
    "ssn": "555-55-5555",
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "1965-01-01",
    "middle_name": "Theodore",
    "gender": "M"
  }

  //Example Request Body - required fields only
  {
    "ssn": "555-55-5555",
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "1965-01-01"
  }
```

</details>
</br>

<details><summary>Sample JSON - schema.properties "example" fields</summary>

```json
  "paths": {
    "/status": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
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
          }
        }
      }
    }
  }

  //Example Request Body - default
  {
    "ssn": "555-55-5555",
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "1965-01-01",
    "middle_name": "Theodore",
    "gender": "M"
  }

  //Example Request Body - required fields only
  {
    "ssn": "555-55-5555",
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "1965-01-01"
  }
```

</details>
</br>

# Validation

Currently validation is broken up into two testing suites. One performs `example group testing` and has suite Id `positive` and the other performs linting using [Spectral](https://github.com/stoplightio/spectral) rulesets and has suite Id `oas-ruleset`.

## Example Group Validation

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

## Spectral Linting

[Spectral](https://github.com/stoplightio/spectral) drives the OAS linting behavior in LOAST based on a set of highly configurable rulesets.

### Configuration

All ruleset behavior is controlled by the yamls at `\src\suites\rulesets`. These yamls normally extend the `default` or `core rulesets` provided by Spectral and include additional `custom rulesets` intended to tailor validation for the VA. Each ruleset file is automatically detected and registered as a separate testing suite.

Details surrounding the `core ruleset` and `customization` can be found at [Spectral's OpenAPI-Rules](https://github.com/stoplightio/spectral/blob/develop/docs/reference/openapi-rules.md)

### Adding a new Spectral driven suite or ruleset

Create a new yaml with path similar to "\src\suites\rulesets\\`<newSuite>`.yaml". A suite with name `newSuite` will automatically generate in LOAST based on the file name. This can then run alongside the other suites or it can be run standalone using the command line argument "-i `newSuite`"

Keep in mind:

- There is no limit to the number of Spectral driven suites
- Rules with a similar goal should be grouped together in the same suite file to aid in reporting
- Suites should avoid duplicating the rules in the other yamls. Several yamls extending `spectral:oas` should be avoided
- Provided suite name cannot match previously existing suites: 'positive'

### Creating a custom rule

All custom rules are expected to follow a convention and use names starting with "va-`{Rule Group}`-" in order to get grouped with rules testing similar OAS sections. Example: A rule with name 'va-`paths`-one-required' would belong to group `paths`.

Using this convention allows LOAST to display results grouped by the major OAS properties & endpoints. It also allows LOAST to properly track warning/failure/pass statistics. If this convention is not followed, the report will improperly exclude the rule when it passes or throws warnings.

Supported Rule Groups:

- openapi - Rule applies to 'openapi' property or is a generic validation
- info - Rule applies to 'info' property
- servers - Rule applies to 'servers' property
- security - Rule applies to 'security' property
- tags - Rule applies to 'tags' property
- paths - Rule applies to 'paths' property
- schemas - Rule applies to 'schemas' property
- endpoint - Rule applies to all operations in OAS
- property - Rule applies to all operations in OAS and schemas since it checks 'properties' which can be found under request/response/schemas
- openapidoc - Reserved for when Spectral encounters severe problems that prevent rest of OAS being tested

### Jest testing custom rulesets

Since custom rulesets follow a nearly identical pattern concerning setup/testing a "ruleset.test" script has been created that automatically creates new Jest tests from the Spectral yamls and OAS test fixtures.

Setup for the testing requires:

- Updating the file at "/test/suites/rulesets/fixtures/setup.json". Format below:

```
  {
    "`ruleset or suite name`" : {
      "`rule name 1`": ["failure message 1","failure message 2", "failure message 3",...],
      "`rule name 2`": ["failure message"],
    },
    "`second ruleset`" : {
      "`another rule`": ["simple failure message"],
    }
  }
```

- Creating a OAS file at "/test/suites/rulesets/fixtures/`{rule name}`-pass.json" where the rule should detect no issues
- Creating a second OAS file at "/test/suites/rulesets/fixtures/`{rule name}`-fail.json" where the rule should detect the issues declared in the setup.json

Keep in mind:

- Rules not declared in the setup.json are excluded from testing
- If a rule does not set a "message" property, then Spectral will simply report the rule's description as the message
- Rule descriptions don't support placeholders

### Removing a Spectral driven suite

Delete the associated yaml under `\src\suites\rulesets` and LOAST will automatically stop offering the suite.

### Custom Rulesets (suite: oas-ruleset)

| Name                                              | Severity | Description                                                                 |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| va-openapi-supported-versions                     | Error    | Platform tooling requires openapi version 3.x.x                             |
| va-info-description-minimum-length                | Warning  | Info's description appears to be short on details. Expected 1000+ chars     |
| va-paths-one-required                             | Error    | At least one path must exist                                                |
| va-paths-one-operation-required                   | Error    | Each path must have at least one operation                                  |
| va-endpoint-summary-required                      | Error    | Endpoints must have a summary                                               |
| va-endpoint-summary-minimum-length                | Warning  | Endpoint summary is too short. Expected 10+ chars                           |
| va-endpoint-description-minimum-length            | Warning  | Endpoint descripting is too short. Expected 30+ chars                       |
| va-endpoint-param-description-required            | Error    | Parameters must have a description                                          |
| va-endpoint-param-example-required                | Error    | Parameters marked as required must have an 'example' or 'examples' property |
| va-endpoint-request-content-supported-mediatypes  | Error    | Insure content's media type under request is expected/supported             |
| va-endpoint-response-content-supported-mediatypes | Error    | Insure content's media type under response is expected/supported            |

# Local Development

See our [contribution guide](CONTRIBUTING.md)

## Running Commands

Before running any commands locally and after any code changes, the code will need to be built using `npm run build`.
While developing locally, `$ ./bin/run` is the equivalent of running `$ loast` with the CLI installed.

- e.g.: `$ ./bin/run suites -a YOUR_API_KEY -s https://sandbox-api.va.gov/services/va_facilities/{version} test/fixtures/facilities_oas.json` will validate with all suites against the facilities OAS present in our test fixtures.
- To run particular suites provide 'id' or 'i' flag with the ID a suite as the value e.g.: `$ ./bin/run suites -a YOUR_API_KEY -s https://sandbox-api.va.gov/services/va_facilities/{version} test/fixtures/facilities_oas.json -i oas-ruleset -i positive`

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
        "https://sandbox-api.va.gov/services/va_facilities/{version}",
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

To build the application automatically, configure a before-launch task of type **Run npm script**:  
Set the **Command** field to: `run`  
Set the **Scripts** field to: `build`

## Releasing

See [oclif's release documentation](https://oclif.io/docs/releasing) for instructions on how to release new versions of the CLI both to npm and as standalone packages.

### Node Version Tools

- **NVM:** `.nvmrc` file is included in the repo to lock in the version of node used for development.

  - Run `nvm use` to change your version of node. You may need to run `nvm install` first if the required version isn't installed.
  - You can automatically call `nvm use` by updating your `$HOME/.bashrc` or `$HOME/.zshrc` more on that [here.](https://github.com/nvm-sh/nvm#nvmrc)

- **ASDF:** `.tool-versions` file is also included in the repo to lock in the version of node used for development.
  - Run `asdf install` to install the version of node in the `.tool-versions` file.
  - Additional settings and adding a `.asdfrc` to your home directory [here.](https://asdf-vm.com/#/core-configuration?id=homeasdfrc)
