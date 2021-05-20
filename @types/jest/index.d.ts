declare namespace jest {
  interface Matchers<R> {
    toContainValidationFailure(value: string): R;
    toContainValidationWarning(value: string): R;
  }
}
