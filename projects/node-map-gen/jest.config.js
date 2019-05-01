module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['jest-extended', 'expect-more-jest'],
  verbose: true,
  collectCoverage: false,
  coveragePathIgnorePatterns: ['.json'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
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
