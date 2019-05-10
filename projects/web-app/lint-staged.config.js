module.exports = {
  'package.json': ['prettier-package-json', 'git add'],
  'src/**/*.{ts,json}': [
    'tslint --fix',
    'prettier --write',
    'git add',
    'jest --findRelatedTests',
  ],
};
