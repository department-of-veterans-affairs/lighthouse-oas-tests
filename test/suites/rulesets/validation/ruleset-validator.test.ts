import OASSchema from '../../../../src/oas-parsing/schema/oas-schema';
import { Type } from '../../../../src/suites/rulesets/validation/ruleset-message';
import RulesetValidator from '../../../../src/suites/rulesets/validation/ruleset-validator';

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
  {
    // Special case should get converted to error even with severity: 1
    code: 'high-level-error',
    severity: 1,
    path: [],
    message: 'Journey cannot be decided',
  },
  {
    code: 'info-error',
    severity: 1,
    path: ['info', 'moat'],
    message: 'Info missing property',
  },
  {
    code: 'servers-error',
    severity: 1,
    path: ['servers', 'moat'],
    message: 'Servers missing property',
  },
  {
    code: 'tags-error',
    severity: 1,
    path: ['tags', 'moat'],
    message: 'Tags missing property',
  },
  {
    code: 'va-paths-custom-rule',
    severity: 1,
    path: ['paths', 'moat'],
    message: 'Paths missing property',
  },
  {
    code: 'va-endpoint-custom-rule',
    severity: 1,
    path: ['paths', '/thering', 'GET', 'moat'],
    message: 'The Rings location is unknown',
  },
];

const emptyMap = new Map();
const case1 = new Map().set('bad-properties', {
  failures: new Map().set(
    '405373e4797f2011d4abb89eba621602681e2f01',
    expect.objectContaining({
      message: 'Ring was not found',
      _path: [],
    }),
  ),
  warnings: emptyMap,
});
const case2 = new Map().set('missing-properties', {
  failures: emptyMap,
  warnings: new Map().set(
    '5af72338e7d380ef0e06a02db6a2c58b067b9484',
    expect.objectContaining({
      message: 'Ring is hidden Path: moat',
      _path: ['moat'],
    }),
  ),
});
const case3 = new Map().set('extra-long-path', {
  failures: emptyMap,
  warnings: new Map().set(
    '90540b1ac12004d4762f5b4b2a37aac7a59d6758',
    expect.objectContaining({
      message: 'That journey is too long',
      _path: [],
    }),
  ),
});
const case4 = new Map().set('high-level-error', {
  failures: new Map().set(
    'a31be1fb2dcc42cab8b67b414bde2d2c94a851ba',
    expect.objectContaining({
      message: 'Journey cannot be decided',
      _path: [],
    }),
  ),
  warnings: emptyMap,
});
const case5 = new Map().set('info-error', {
  failures: emptyMap,
  warnings: new Map().set(
    'df9f0ea7d750210d67b0c5ba0d2ff428a80b153b',
    expect.objectContaining({
      message: 'Info missing property',
      _path: [],
    }),
  ),
});
const case6 = new Map().set('servers-error', {
  failures: emptyMap,
  warnings: new Map().set(
    '27622803297ebc61e62310fdb55fd36a81b5488f',
    expect.objectContaining({
      message: 'Servers missing property',
      _path: [],
    }),
  ),
});
const case7 = new Map().set('tags-error', {
  failures: emptyMap,
  warnings: new Map().set(
    '84ed1bf17c4c68fc59c68ea968684da3b406a993',
    expect.objectContaining({
      message: 'Tags missing property',
      _path: [],
    }),
  ),
});
const case8 = new Map().set('va-paths-custom-rule', {
  failures: emptyMap,
  warnings: new Map().set(
    '8f1796be9ee67d74567c5d44f808caf72874c3d8',
    expect.objectContaining({
      message: 'Paths missing property',
      _path: [],
    }),
  ),
});
const case9 = new Map().set('va-endpoint-custom-rule', {
  failures: emptyMap,
  warnings: new Map().set(
    '98201d88f9e9a7b7f591e75866b74fd4096b7dcf',
    expect.objectContaining({
      message: 'The Rings location is unknown Path: moat',
      _path: ['moat'],
    }),
  ),
});

const resultOperationMap = new Map();
resultOperationMap.set('ROOT:tower', case1);
resultOperationMap.set('TOWER:rampart', case2);
resultOperationMap.set('ROOT:away', case3);
resultOperationMap.set('ROOT:openapidoc', case4);
resultOperationMap.set('ROOT:info', case5);
resultOperationMap.set('ROOT:servers', case6);
resultOperationMap.set('ROOT:tags', case7);
resultOperationMap.set('ROOT:paths', case8);
resultOperationMap.set('GET:/thering', case9);

jest.mock('@stoplight/spectral-core', () => {
  return {
    Spectral: jest.fn().mockImplementation(() => {
      return {
        Spectral: jest.fn(),
        setRuleset: jest.fn(),
        ruleset: {
          rules: {
            'missing-properties': { enabled: true },
            'bad-properties': { enabled: false },
            'va-paths-custom-rule': { enabled: true },
            'va-endpoint-custom-rule': { enabled: true },
          },
        },
        run: mockSpectralRun,
      };
    }),
  };
});

mockSpectralRun.mockResolvedValue(spectralResults);

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../../../src/suites/rulesets/validation/ruleset-wrapper', () => {
  return {
    getRuleset: jest.fn(),
  };
});

let oasSchema: OASSchema;
let rulesetName: string;
let operation: string;
let ruleName: string;

describe('RulesetValidator', () => {
  beforeEach(() => {
    oasSchema = new OASSchema({ spec: {} });
    rulesetName = 'oas-ruleset';
    operation = '/findTheRing:GET';
    ruleName = 'missing-properties';
  });

  describe('addMessage', () => {
    it('adds a validation failure', () => {
      const validator = new RulesetValidator(oasSchema, rulesetName);
      validator.addMessage(operation, ruleName, Type.RulesetError, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });

    it('adds a validation warning', () => {
      const validator = new RulesetValidator(oasSchema, rulesetName);
      validator.addMessage(operation, ruleName, Type.RulesetWarning, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });

    it('adds a repeated message', () => {
      const validator = new RulesetValidator(oasSchema, rulesetName);
      validator.addMessage(operation, ruleName, Type.RulesetWarning, [
        'The ring has not be found',
      ]);
      validator.addMessage(operation, ruleName, Type.RulesetWarning, [
        'The ring has not be found',
      ]);

      expect(validator.operationMap.get(operation)?.has(ruleName)).toEqual(
        true,
      );
    });
  });

  describe('performValidation', () => {
    it('run oas-ruleset and sanitizes nine results', async () => {
      oasSchema.getOperations = jest.fn().mockResolvedValue([]);
      const validator = new RulesetValidator(oasSchema, rulesetName);
      await validator.validate();

      expect(validator.operationMap.size).toEqual(9);
      expect(validator.operationMap).toMatchObject(resultOperationMap);
    });
  });
});
