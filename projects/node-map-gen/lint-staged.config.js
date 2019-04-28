module.exports = {
  'package.json': ['prettier-package-json --write', 'git add'],
  '**/*.ts': ['yarn lint --fix', 'git add', 'jest --findRelatedTests'],
};
