/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: "node",

  // Tests compile to CommonJS so `jest.mock` and `jest.spyOn` behave normally.
  // The source is ESM ("type": "module"), so two things bridge the gap:
  // moduleNameMapper strips the .js specifiers, and transformIgnorePatterns
  // lets ESM-only dependencies through the transformer.
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
    "^.+\\.m?js$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },

  // uuid v14 ships ESM only; without this jest hits `export` in its dist and
  // fails to parse. Anything else added here must be ESM-only too.
  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testMatch: ["**/__tests__/**/*.test.ts"],
  testTimeout: 15000,
};
