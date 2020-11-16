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
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g loast
$ loast COMMAND
running command...
$ loast (-v|--version|version)
loast/0.1.0 darwin-x64 node-v14.15.0
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

_See code: [src/commands/positive.ts](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/v0.1.0/src/commands/positive.ts)_
<!-- commandsstop -->
