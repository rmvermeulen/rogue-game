module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['jest-extended', 'expect-more-jest'],
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['setupJest', '.json'],
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
  ],
};
