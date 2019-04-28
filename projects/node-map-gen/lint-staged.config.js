module.exports = {
  'package.json': ['prettier-package-json --write', 'git add'],
  'src/**/*.ts': ['yarn lint --fix', 'git add', 'jest --findRelatedTests'],
  '__tests__/**/*.ts': ['yarn lint:test --fix', 'git add', 'jest'],
};
