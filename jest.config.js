/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/vendor/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
