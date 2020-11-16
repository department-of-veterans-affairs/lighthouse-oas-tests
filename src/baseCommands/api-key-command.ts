import Command, { flags } from '@oclif/command';

abstract class ApiKeyCommand extends Command {
  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({ char: 'a', description: 'API key to use' }),
  };

  protected apiKey = '';

  // linting does not recognize rules starting with '@' as valid, so we need to
  // supply another non-existing rule before the one we actually want to disable
  // eslint-disable-next-line no, @typescript-eslint/require-await
  async init(): Promise<void> {
    this.validateApiKey();
  }

  private validateApiKey(): void {
    const { flags } = this.parse(this.constructor as typeof ApiKeyCommand);
    const apiKey = flags.apiKey ?? process.env.API_KEY;

    if (!apiKey) {
      this.error(
        'apiKey flag should be provided or the API_KEY environment variable should be set',
        { exit: 2 },
      );
    }

    this.apiKey = apiKey;
  }
}

export default ApiKeyCommand;
