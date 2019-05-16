module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended', 'expect-more-jest'],
  verbose: true,
  collectCoverage: false,
  coveragePathIgnorePatterns: ['.json', '.d.ts'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1.ts',
  },
  testRunner: 'jest-circus/runner',
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/../node_modules/',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-suspend',
    ['jest-watch-toggle-config', { setting: 'bail' }],
    ['jest-watch-toggle-config', { setting: 'collectCoverage' }],
    ['jest-watch-toggle-config', { setting: 'notify' }],
    ['jest-watch-toggle-config', { setting: 'verbose' }],
  ],
};
