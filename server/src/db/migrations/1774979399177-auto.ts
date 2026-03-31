import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1774979399177 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Вмикаємо розширення pg_trgm (якщо воно ще не увімкнене)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // 2. Створюємо GIN індекс для колонки email таблиці user.
    // GIN (Generalized Inverted Index) ідеально підходить для тріграм.
    // Використовуємо gin_trgm_ops для підтримки операторів схожості (LIKE, %).
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_EMAIL_TRGM" ON "user" USING gin ("email" gin_trgm_ops);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Видаляємо індекс
    await queryRunner.query(`DROP INDEX "IDX_USER_EMAIL_TRGM";`);

    // Примітка: Ми зазвичай НЕ видаляємо розширення (DROP EXTENSION) у down,
    // оскільки інші таблиці або індекси можуть залежати від нього.
  }
}
