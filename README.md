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
loast/0.0.0 darwin-x64 node-v12.19.0
$ loast --help [COMMAND]
USAGE
  $ loast COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`loast hello [FILE]`](#loast-hello-file)
* [`loast help [COMMAND]`](#loast-help-command)

## `loast hello [FILE]`

describe the command here

```
USAGE
  $ loast hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ loast hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
