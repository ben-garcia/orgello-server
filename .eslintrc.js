module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    node: true,
  },
  rules: {
    'no-console': 0,
    'prettier/prettier': 'error',
    'no-restricted-globals': 0,
  },
};
