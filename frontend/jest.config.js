/* eslint-disable @typescript-eslint/no-require-imports */

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageProvider: "babel",
  collectCoverageFrom: ["app/utils/apis.js"],
  coverageReporters: ["text", "lcov", "json"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
