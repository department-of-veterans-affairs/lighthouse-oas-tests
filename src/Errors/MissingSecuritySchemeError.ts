export class MissingSecuritySchemeError extends Error {
  constructor(missingSecuritySchemes: string[]) {
    super(
      `The following security requirement exists but no corresponding security scheme exists on the components object: ${missingSecuritySchemes.join(
        ', ',
      )}.
See more at: https://swagger.io/specification/#security-requirement-object`,
    );
  }
}
