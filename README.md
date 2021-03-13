loast
=====

CLI for testing Lighthouse APIs using OpenAPI specs

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/loast.svg)](https://npmjs.org/package/loast)
[![Downloads/week](https://img.shields.io/npm/dw/loast.svg)](https://npmjs.org/package/loast)
[![License](https://img.shields.io/npm/l/loast.svg)](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Local Development](#local-development)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g loast
$ loast COMMAND
running command...
$ loast (-v|--version|version)
loast/0.2.0 darwin-x64 node-v12.19.0
$ loast --help [COMMAND]
USAGE
  $ loast COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`loast help [COMMAND]`](#loast-help-command)
* [`loast positive PATH`](#loast-positive-path)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `loast positive PATH`

Runs positive smoke tests for Lighthouse APIs based on OpenAPI specs

```
USAGE
  $ loast positive PATH

ARGUMENTS
  PATH  Url or local file path containing the OpenAPI spec

OPTIONS
  -a, --apiKey=apiKey  API key to use
  -f, --file           Provide this flag if the path is to a local file
  -h, --help           show CLI help
```

_See code: [src/commands/positive.ts](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/v0.2.0/src/commands/positive.ts)_
<!-- commandsstop -->

# OpenApi Spec Setup
## Example Groups
If your endpoint supports different groupings of parameters (such as taking either an address or a set of positional coordinates), you can use the `examples`  field on the `Parameter` object to create groupings.
Create an `examples` object on each parameter that needs to go into a group in the form:
```json
"examples": {
  "group name": {
    "value": "example value"
  }
}
```
`loast` will go through and execute a test against the endpoint for each grouping it finds, including any required parameters in each request. 

# Validation Failures
The sections below contain details about validation failures that can be produced by loast and how to fix them. Failures will include a path to the place in the schema where the failure occured.
## Parameter Validation Failures
If a parameter validation failure occurs the positive command will not attempt to send a request that includes the parameter that failed.
Parameter validation failures include the following as well as the schema failures listed below.

| Failure                       | Description                                                                                     | Fix                                                                                                       |
| ---------------------------   | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Missing required parameters   | No example is provided for a parameter marked as required                                       | Add examples for all required parameters or remove the required flag if the parameter is not required     |
| Invalid parameter object      | The parameter object does not contain either a schema or content field, or contains both fields | Add either a schema or content field to the parameter, but not both                                       |
| Invalid parameter content     | The parameter object's content field contains zero or more than one keys                        | Ensure the content field contains only one key specifying the media type                                  |
| Missing content schema object | A valid schema object is missing from the media object in the content field                     | Add the missing schema object to the media type object associated with the content field of the parameter |

## Response Validation Failures
If one of these validation failures occur the rest of the response will not be validated.

| Failure               | Description                                                        | Fix                          |
| --------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Status code mismatch  | Actual response has a status code that is not included in the OAS  | Add the missing status code  |
| Content type mismatch | Actual response has a content type that is not included in the OAS | Add the missing content type |

## Schema Validation Failures
These failures can occur for parameters and responses.

| Failure                   | Description                                                                | Fix                                                                                           |
| ------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Null value not allowed    | Actual object is null, but the schema does not allow null values           | If null values should be allowed for this object set the nullable field to true in the schema |
| Type mismatch             | Actual object type does not match type defined in the schema               | Update the schema to correctly set the type                                                    |
| Duplicate enum values     | Schema enum contains duplicate values                                      | Remove duplicate values from the enum                                                         |
| Enum mismatch             | Actual object does not match a value in the schema enum                    | Update the enum to contain all valid values                                                   |
| Missing `items` field     | Schemas for arrays must include the `items` field                          | Set the `items` field on array schemas                                                        |
| Missing `properties` field| Schemas for objects must include the `properties` field                    | Set the `properties` field on object schemas                                                  |
| Properties mismatch       | Actual object contains properties not present in the schema                | Update the schema so all valid properties are included                                        |
| Missing required property | Actual object does not contain a property marked as required in the schema | Update the schema so that only required properties are marked as required                     |
| Invalid `operationId` | There is no operation with that id | Check for misspellings or add the missing `operationId` to the schema |

# Local Development

## Running Commands
Before running any commands locally and after any code changes, the code will need to be built using `npm run build`.  
While developing locally, `$ ./bin/run` is the equivalent of running `$ loast` with the CLI installed.
- e.g.: `$ ./bin/run positive -a YOUR_API_KEY -f test/fixtures/facilities_oas.json` will run positive tests against the facilities OAS present in our test fixtures.

## Testing
Tests are setup with [Jest](https://jestjs.io/). Run tests using the `npm run test` command.

## Linting
This library is setup with [eslint](https://eslint.org/) and [Prettier](https://prettier.io/). Run linting using the `npm run lint` command or the `npm run lint:fix` command for in place corrections of errors.

## Releasing
See [oclif's release documentation](https://oclif.io/docs/releasing) for instructions on how to release new versions of the CLI both to npm and as standalone packages
