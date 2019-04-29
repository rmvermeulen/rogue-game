module.exports = {
  hooks: {
    'pre-commit': 'pretty-quick --write && lint-staged',
    'pre-push': 'jest --ci',
  },
};
