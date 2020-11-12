module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json"],
  },
  plugins: ["@typescript-eslint", "mocha", "prettier"],
  extends: [
    "eslint:recommended",
    "oclif",
    "oclif-typescript",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:mocha/recommended",
    "prettier/@typescript-eslint",
    "prettier",
    "plugin:prettier/recommended",
  ],
  env: {
    node: true,
  },
  rules: {
    semi: ["error", "always"],
    "@typescript-eslint/camelcase": "off",
    "comma-dangle": ["error", "always-multiline"],
    indent: ["error", 2],
    "prettier/prettier": ["error"],
  },
  overrides: [
    {
      files: ["*.test.ts"],
      rules: {
        "@typescript-eslint/unbound-method": 0,
        "max-nested-callbacks": 0
      },
    },
  ]
};
