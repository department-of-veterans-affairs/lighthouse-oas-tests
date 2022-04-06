import ValidationFailure from './validation-failure';

class InvalidResponse extends ValidationFailure {
  constructor(responseCode: number) {
    super(
      `Response status code was a non 2XX value: ${responseCode?.toString()}`,
      [],
    );
  }
}

export default InvalidResponse;
