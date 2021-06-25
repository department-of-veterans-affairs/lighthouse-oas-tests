import { Request } from 'swagger-client';
import CurlFactory from '../../utilities/curl-factory/curl-factory';
import ValidationFailure from './validation-failure';

class InvalidResponse extends ValidationFailure {
  private _curl: string;

  constructor(request: Request) {
    super('Response status code was a non 2XX value', []);
    this._curl = CurlFactory.buildFromRequest(request);
  }

  get curl(): string {
    return this._curl;
  }
}

export default InvalidResponse;
