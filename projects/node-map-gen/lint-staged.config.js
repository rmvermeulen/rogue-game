module.exports = {
  'package.json': ['prettier-package-json --write', 'git add'],
  'src/**/*.ts': ['yarn lint --fix', 'git add'],
  '__tests__/**/*.ts': ['yarn lint:test --fix', 'git add'],
  '**/*.ts': ['jest --findRelatedTests'],
};
