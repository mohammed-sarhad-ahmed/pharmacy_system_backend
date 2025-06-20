module.exports = {
  env: {
    es2022: true,
    node: true
  },
  parserOptions: {
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
    'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val' }]
  }
};
