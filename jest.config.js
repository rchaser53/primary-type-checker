module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  // testEnvironment: "node",
  testURL: 'http://localhost/',
  globals: {
    NODE_ENV: 'test'
  },
  transform: {
    '^.+\\.ts$': '<rootDir>/preprocessor.js'
  },
  moduleNameMapper: {
    '^~/(.+)': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', 'dest'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*-test.(ts|js)']
}
