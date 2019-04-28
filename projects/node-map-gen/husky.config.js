module.exports = {
  hooks: {
    'pre-commit': 'pretty-quick --write && lint-staged',
  },
};
