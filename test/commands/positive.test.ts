import { expect, test } from '@oclif/test';

describe('Positive', () => {
  describe('API key is not set', () => {
    beforeEach(() => {
      process.env.API_KEY = '';
    });

    test
      .command(['positive', 'testPath'])
      .catch((error) => {
        expect(error.message).to.equal(
          'apiKey flag should be provided or the API_KEY environment variable should be set',
        );
      })
      .it('throws an error');
  });

  describe('The file flag is passed', () => {
    beforeEach(() => {
      process.env.API_KEY = 'testApiKey';
    });
    const baseCommand = ['positive', '-f'];

    describe('Json is not loaded from the file', () => {
      describe('Provided file does not exist', () => {
        test
          .command([...baseCommand, 'fileDoesNotExist.json'])
          .catch((error) => {
            expect(error.message).to.equal('unable to load json file');
          })
          .it('throws an error');
      });

      describe('Non-json file', () => {
        test
          .command([...baseCommand, './fixtures/file.xml'])
          .catch((error) => {
            expect(error.message).to.equal('unable to load json file');
          })
          .it('throws an error');
      });

      describe('Invalid json', () => {
        test
          .command([...baseCommand, './fixtures/invalid.json'])
          .catch((error) => {
            expect(error.message).to.equal('unable to load json file');
          })
          .it('throws an error');
      });
    });
  });
});
