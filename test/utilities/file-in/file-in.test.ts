import FileIn from '../../../src/utilities/file-in';

describe('FileIn', () => {
  describe('loadSpecFromFile', () => {
    it('throws an error if the file type is unsupported', () => {
      expect(() => FileIn.loadSpecFromFile('./test/fixtures/file.xml')).toThrow(
        'File is of a type not supported by OAS (.json, .yml, .yaml)',
      );
    });

    describe('JSON file', () => {
      it('throws an error if the file does not exist', () => {
        expect(() => FileIn.loadSpecFromFile('fileDoesNotExist.json')).toThrow(
          'unable to load json file',
        );
      });

      it('throws an error if file has invalid JSON', () => {
        expect(() =>
          FileIn.loadSpecFromFile('./test/fixtures/invalid.json'),
        ).toThrow('unable to load json file');
      });

      it('successfully loads the file', () => {
        const spec = FileIn.loadSpecFromFile(
          './test/fixtures/simple_forms_oas.json',
        );
        expect(spec).toBeTruthy();
        expect(spec.info.title).toEqual('VA Forms');
      });
    });

    describe('YAML file', () => {
      it('throws an error if the file does not exist', () => {
        expect(() => FileIn.loadSpecFromFile('fileDoesNotExist.yml')).toThrow(
          'unable to load yaml file',
        );
      });

      it('successfully loads the file', () => {
        const spec = FileIn.loadSpecFromFile('./test/fixtures/forms_oas.yaml');
        expect(spec).toBeTruthy();
        expect(spec.info.title).toEqual('VA Forms');
      });
    });
  });

  describe('loadConfigFromFile', () => {
    it('throws an error if the path is a url', () => {
      expect(() =>
        FileIn.loadConfigFromFile(
          'https://the-sorcerers-stone.com/config.json',
        ),
      ).toThrow('Path must be to a local file.');
    });

    it('throws an error if the file type is unsupported', () => {
      expect(() =>
        FileIn.loadConfigFromFile('./test/fixtures/forms_oas.yaml'),
      ).toThrow('Only file type .json is supported.');
    });

    describe('JSON file', () => {
      it('throws an error if the file does not exist', () => {
        expect(() =>
          FileIn.loadConfigFromFile('fileDoesNotExist.json'),
        ).toThrow('Unable to load json file');
      });

      it('throws an error if file has invalid JSON', () => {
        expect(() =>
          FileIn.loadConfigFromFile('./test/fixtures/invalid.json'),
        ).toThrow('Unable to load json file');
      });

      it('successfully loads the file', () => {
        const config = FileIn.loadConfigFromFile(
          './test/fixtures/configs/test-config.json',
        );
        expect(config).toBeTruthy();
        const keys = Object.keys(config);
        expect(keys).toContain('kingslanding');
        expect(keys).toContain('dragonstone');
        expect(keys).toContain('stormsend');
      });
    });
  });
});
