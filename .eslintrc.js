module.exports = {
  env: {
    es2022: true,
    node: true
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  extends: ['airbnb', 'plugin:node/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'spaced-comment': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'no-process-exit': 'off',
    'no-param-reassign': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val|_' }],
    'guard-for-in': 'off',
    // Catch arrow functions assigned to Mongoose schema methods/statics
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "AssignmentExpression > MemberExpression.object[property.name='methods'] > ArrowFunctionExpression",
        message: 'Avoid arrow functions in Mongoose methods.'
      }
    ]
  }
};
