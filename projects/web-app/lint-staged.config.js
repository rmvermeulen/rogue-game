module.exports = {
  'package.json': ['prettier-package-json', 'git add'],
  'src/**/*.tsx': ['yarn lint --fix', 'git add', 'jest --findRelatedTests'],
};
