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
