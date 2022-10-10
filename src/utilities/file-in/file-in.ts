import { readFileSync } from 'fs';
import { extname, resolve } from 'path';
import { Json } from 'swagger-client';
import yaml from 'js-yaml';
import parsePath from 'parse-path';
import {
  FILE_PROTOCOL,
  JSON_FILE_EXTENSION,
  YAML_FILE_EXTENSION,
  YML_FILE_EXTENSION,
} from '../constants';

export default class FileIn {
  public static loadSpecFromFile(path: string): Json {
    let spec;
    const extension = extname(path);

    if (extension === JSON_FILE_EXTENSION) {
      try {
        spec = readFileSync(resolve(path));
        return JSON.parse(spec);
      } catch (error) {
        throw new Error('unable to load json file');
      }
    } else if (
      extension === YML_FILE_EXTENSION ||
      extension === YAML_FILE_EXTENSION
    ) {
      try {
        const file = readFileSync(resolve(path));
        spec = yaml.load(file);
        return spec;
      } catch (error) {
        throw new Error('unable to load yaml file');
      }
    } else {
      throw new Error(
        'File is of a type not supported by OAS (.json, .yml, .yaml)',
      );
    }
  }

  public static loadConfigFromFile(path: string): Json {
    const parsed = parsePath(path);
    if (parsed.protocol !== FILE_PROTOCOL) {
      throw new Error('Path must be to a local file.');
    }

    let config;
    const extension = extname(path);

    if (extension === JSON_FILE_EXTENSION) {
      try {
        config = readFileSync(resolve(path));
        return JSON.parse(config);
      } catch (error) {
        throw new Error('Unable to load json file');
      }
    } else {
      throw new Error('Only file type .json is supported.');
    }
  }
}
