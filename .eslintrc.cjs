module.exports = {
  env: {
    browser: true,
    webextensions: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:lit/recommended'
  ],
  rules: {
    'arrow-body-style': 'off',
  },
  globals: {
    Set: true,
    Promise: true,
    module: true,
  }
};
