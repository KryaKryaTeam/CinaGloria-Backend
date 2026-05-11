import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(e2e-)?spec\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/test/jestSetup.ts'],

  // 1. ПРАВИЛЬНЕ МІСЦЕ ДЛЯ transformIgnorePatterns
  // Ми кажемо Jest: "Не ігноруй ці папки, навіть якщо вони в node_modules"
  transformIgnorePatterns: [
    'node_modules/(?!(file-type|strtok3|peek-readable|token-types|uint8array-extras)/)',
  ],

  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // 2. ДОДАТКОВО ДЛЯ ESM
  // Це допоможе Jest зрозуміти, що робити з файлами, які використовують import/export
  extensionsToTreatAsEsm: ['.ts'],

  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/db/migrations/**',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  verbose: true,
  detectOpenHandles: true,
};

export default config;
