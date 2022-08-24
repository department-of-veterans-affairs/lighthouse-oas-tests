abstract class BaseValidator {
  protected validated: boolean;

  constructor() {
    this.validated = false;
  }

  abstract performValidation(): Promise<void>;

  public validate = async (): Promise<void> => {
    if (this.validated) {
      return;
    }

    await this.performValidation();
    this.validated = true;
  };
}

export default BaseValidator;
