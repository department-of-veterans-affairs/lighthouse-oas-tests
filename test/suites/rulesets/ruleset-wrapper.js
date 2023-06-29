/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line node/no-extraneous-require
const { fetch } = require('@stoplight/spectral-runtime');
const fs = require('fs');
const {
  bundleAndLoadRuleset,
  // eslint-disable-next-line node/no-missing-require
} = require('@stoplight/spectral-ruleset-bundler/with-loader');

// Separate JS wrapper required due to Spectral's './with-loader' being exposed with package.json 'export'.
//  That approach is supported by few versions of TypeScript and fewer versions of Jest.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getRuleset = async (pathStr) => {
  const ruleset = await bundleAndLoadRuleset(pathStr, {
    fs,
    fetch,
  });
  return ruleset;
};

module.exports = {
  getRuleset,
};
