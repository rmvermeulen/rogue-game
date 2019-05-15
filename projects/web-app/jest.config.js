module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['jest-extended', 'tsconfig-paths/register'],
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['setupJest'],
  moduleNameMapper: {
    '@utils/(.*)': '<rootDir>/src/utils/$1',
    '@defs/(.*)': '<rootDir>/src/defs/$1.d.ts',
    '@containers/(.*)': '<rootDir>/src/containers/$1',
    '@components/(.*)': '<rootDir>/src/components/$1',
    '@src/(.*)': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
        tsConfig: 'tsconfig.spec.json',
      },
    },
  },
};
