import Command, { flags } from '@oclif/command';

abstract class ApiCommand extends Command {
  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({
      char: 'a',
      env: 'API_KEY',
      description: 'API key to use',
    }),
  };
}

export default ApiCommand;
