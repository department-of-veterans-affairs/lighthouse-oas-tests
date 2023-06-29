import path from 'path';
import { ISpectralDiagnostic, Spectral } from '@stoplight/spectral-core';
import OASSchema from '../../../src/oas-parsing/schema';
import { getRuleset } from './ruleset-wrapper';
import { FileIn } from '../../../src/utilities/file-in';
import rulesetFixtures from './fixtures/setup.json';

// Logic below dynamically generates a series of tests for Spectral rulesets located at "/src/suites/rulesets/{{ruletSetName}}.yaml"
//  "/test/suites/rulesets/fixtures/setup.json" declares spectral rules & failure messaging that are tested for rulesets
//  "/test/suites/rulesets/fixtures/{{ruleName}}-pass.json" & "/fixtures/{{ruleName}}-fail.json" act as OAS files for pass and failures test

enum ExpectedOutcome {
  PASS,
  FAIL,
}

function resolveFixturePath(
  ruleName: string,
  expectedOutcome: ExpectedOutcome,
): string {
  const testFileType = '.json';
  let suffix = '';

  if (expectedOutcome === ExpectedOutcome.PASS) {
    suffix = '-pass' + testFileType;
  }
  if (expectedOutcome === ExpectedOutcome.FAIL) {
    suffix = '-fail' + testFileType;
  }

  return path.resolve(
    path.join('./test/suites/rulesets/fixtures', ruleName + suffix),
  );
}

async function setupSpectral(rulesetName: string): Promise<Spectral> {
  const rulesetPath = path.resolve(
    path.join('./src/suites/rulesets/', rulesetName + '.yaml'),
  );

  const spectral = new Spectral();
  spectral.setRuleset(await getRuleset(rulesetPath));

  return spectral;
}

function setupFixtureSchema(
  ruleName: string,
  expectedOutcome: ExpectedOutcome,
): OASSchema {
  const fixturePath = resolveFixturePath(ruleName, expectedOutcome);

  const oasSchemaOptions: ConstructorParameters<typeof OASSchema>[0] = {};
  oasSchemaOptions.spec = FileIn.loadSpecFromFile(fixturePath);
  return new OASSchema(oasSchemaOptions);
}

async function getResultsForRule(
  rulesetName: string,
  ruleName: string,
  expectedOutcome: ExpectedOutcome,
): Promise<ISpectralDiagnostic[]> {
  const spectral = await setupSpectral(rulesetName);
  const schema = setupFixtureSchema(ruleName, expectedOutcome);
  const results = await spectral.run(await schema.getRawSchema());

  // Only returning results matching rule being tested
  return results.filter((result) => result.code === ruleName);
}

function createTestsForRule(
  rulesetName: string,
  ruleName: string,
  expectedMessages: string[],
): void {
  it(ruleName + ' rule passes', async () => {
    const results = await getResultsForRule(
      rulesetName,
      ruleName,
      ExpectedOutcome.PASS,
    );

    // Spectral should provide no details or messages for a rule that passed
    expect(results).toHaveLength(0);
  });

  const issueText = expectedMessages.length > 1 ? 'issues' : 'issue';

  it(
    ruleName + ` rule generates ${expectedMessages.length} ${issueText}`,
    async () => {
      const results = await getResultsForRule(
        rulesetName,
        ruleName,
        ExpectedOutcome.FAIL,
      );

      const messages: string[] = [];
      results.forEach((result) => {
        messages.push(result.message);
      });

      expect(messages).toEqual(expectedMessages);
    },
  );
}

function createTestsForRulesets(): void {
  const rulesetNames = Object.keys(rulesetFixtures);

  rulesetNames.forEach((rulesetName) => {
    describe(rulesetName, () => {
      const ruleset = rulesetFixtures[rulesetName];
      const ruleNames = Object.keys(ruleset);

      ruleNames.forEach((ruleName) => {
        const expectedMessages = ruleset[ruleName];
        createTestsForRule(rulesetName, ruleName, expectedMessages);
      });
    });
  });
}

createTestsForRulesets();
