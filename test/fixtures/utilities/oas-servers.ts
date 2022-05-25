import OASServer from '../../../src/utilities/oas-server/oas-server';

export const chamberOfSecretsServer = new OASServer(
  'https://the-chamber-of-secrets.com',
);
export const prisonerOfAzkabanServer = new OASServer(
  'https://the-prisoner-of-azkaban.com',
);
