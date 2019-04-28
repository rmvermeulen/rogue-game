module.exports = {
  'package.json': ['prettier-package-json --write', 'git add'],
  'src/**/*.ts': ['tslint --fix', 'git add', 'jest --findRelatedTests'],
};
