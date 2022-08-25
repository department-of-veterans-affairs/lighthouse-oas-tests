import { fetch } from '@stoplight/spectral-runtime';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import fs from 'fs';

// Separate JS wrapper required due to Spectral's './with-loader' being exposed with package.json 'export'.
//  That approach is supported by few versions of TypeScript and fewer versions of Jest.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function getRuleset(pathStr) {
  const ruleset = await bundleAndLoadRuleset(pathStr, {
    fs,
    fetch,
  });
  return ruleset;
}
