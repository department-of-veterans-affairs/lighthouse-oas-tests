export const configWithOneMissingPath = {
  kinglanding: {
    apiKey: 'sillyFakeApiKey',
    server: 'https://sandbox-westeros.kingslanding/duties/castles/{version}',
  },
  dragonstone: {
    bearerToken: 'sillyFakeBearerToken',
    path: 'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
    server: 'https://sandbox-westeros.dragonstone/duties/castles/{version}',
  },
  stormsend: {
    path: 'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
    server: 'https://sandbox-westeros.stormsend/duties/castles/{version}',
  },
};
