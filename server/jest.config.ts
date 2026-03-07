import type { Config } from 'jest';

const config: Config = {
  // 1. Вказуємо, що працюємо з TypeScript
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.', // Корінь відносно файлу конфігурації
  testRegex: '.*\\.spec\\.ts$', // Шукаємо файли .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', // Використовуємо ts-jest для компіляції
  },

  // 2. Налаштування аліасів (КРИТИЧНО для вашого проекту)
  // Це дозволяє Jest розуміти імпорти типу 'src/common/...'
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // 3. Збір покриття (Coverage)
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts', // Ігноруємо модулі NestJS
    '!src/main.ts',
    '!src/**/*.entity.ts', // Можна ігнорувати, якщо там немає логіки, але у вас вона є!
  ],
  coverageDirectory: './coverage',

  // 4. Середовище
  testEnvironment: 'node',

  // 5. Оптимізація
  verbose: true, // Показувати деталі кожного тесту
  detectOpenHandles: true, // Допомагає знайти незакриті підключення до БД
};

export default config;
