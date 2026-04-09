import type { Config } from 'jest';

const config: Config = {
  // 1. Вказуємо розширення файлів
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Встановлюємо rootDir на корінь проекту
  rootDir: '.',

  // Шукаємо тести тільки в src або test папках
  testRegex: '.*\\.spec\\.ts$',

  // Трансформація через ts-jest
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        // Це змушує ts-jest використовувати налаштування з tsconfig.json
        // (важливо для декораторів та emitDecoratorMetadata)
        tsconfig: 'tsconfig.json',
        useESM: true, // Вмикаємо підтримку ESM, якщо nodenext лається
      },
    ],
  },

  // 2. Налаштування аліасів (Mapping)
  moduleNameMapper: {
    // Дозволяє розуміти імпорти 'src/...'
    '^src/(.*)$': '<rootDir>/src/$1',
    // Вирішує проблему з розширеннями .js в імпортах при використанні nodenext
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // 3. Збір покриття (Coverage)
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/db/migrations/**', // Міграції не тестуємо
  ],
  coverageDirectory: './coverage',

  // 4. Середовище (Node.js для бекенду)
  testEnvironment: 'node',

  // 5. Додаткові налаштування
  verbose: true,
  detectOpenHandles: true,
  // Якщо використовуєш ESM (через nodenext), іноді потрібно це:
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;
