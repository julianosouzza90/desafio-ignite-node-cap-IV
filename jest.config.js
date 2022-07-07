/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom:[
    "<rootDir>/src/modules/**/useCases/**/*.ts",

  ],
  coverageProvider: "v8",
  coverageReporters: [
    "text-summary",
    "lcov"
  ]
};
