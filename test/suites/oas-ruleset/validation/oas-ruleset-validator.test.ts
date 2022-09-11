import OASSchema from '../../../../src/oas-parsing/schema/oas-schema';
import { Type } from '../../../../src/suites/oas-ruleset/validation/oas-ruleset-message';
import OasRulesetValidator from '../../../../src/suites/oas-ruleset/validation/oas-ruleset-validator';

const mockSpectralRun = jest.fn();
const spectralResults = [
  {
    code: 'bad-properties',
    severity: 0,
    path: ['tower'],
    message: 'Ring was not found',
  },
  {
    code: 'missing-properties',
    severity: 1,
    path: ['tower', 'rampart', 'moat'],
    message: 'Ring is hidden',
  },
  {
    code: 'extra-long-path',
    severity: 1,
    path: ['_client', 'client', 'too', 'far', 'away'],
    message: 'That journey is too long',
  },
];

jest.mock('@stoplight/spectral-core', () => {
  return {
    Spectral: jest.fn().mockImplementation(() => {
      return {
        Spectral: jest.fn(),
        setRuleset: jest.fn(),
        run: mockSpectralRun,
      };
    }),
  };
});

mockSpectralRun.mockResolvedValue(spectralResults);

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock(
  '../../../../src/suites/oas-ruleset/validation/ruleset-wrapper',
  () => {
    return {
      getRuleset: jest.fn(),
    };
  },
);

let oasSchema: OASSchema;
let operation: string;
let ruleName: string;

describe('OasRulesetValidator', () => {
  beforeEach(() => {
    oasSchema = new OASSchema({ spec: {} });
    operation = '/findTheRing:GET';
    ruleName = 'missing-properties';
  });

  describe('addMessage', () => {
    it('adds a validation failure', () => {
      const validator = new OasRulesetValidator(oasSchema);
      validator.addMessage(operation, ruleName, Type.OasRulesetError, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });

    it('adds a validation warning', () => {
      const validator = new OasRulesetValidator(oasSchema);
      validator.addMessage(operation, ruleName, Type.OasRulesetWarning, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });

    it('adds a repeated message', () => {
      const validator = new OasRulesetValidator(oasSchema);
      validator.addMessage(operation, ruleName, Type.OasRulesetWarning, [
        'The ring has not be found',
      ]);
      validator.addMessage(operation, ruleName, Type.OasRulesetWarning, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });
  });

  describe('performValidation', () => {
    it('run oas-ruleset and sanitizes three results', async () => {
      const validator = new OasRulesetValidator(oasSchema);
      await validator.validate();

      expect(validator.operationMap.size).toEqual(3);
    });
  });
});
