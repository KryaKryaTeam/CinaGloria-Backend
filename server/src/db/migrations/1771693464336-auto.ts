import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1771693464336 implements MigrationInterface {
  name = 'Auto1771693464336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "avatar_url" character varying NOT NULL DEFAULT 'https://....', "telegram" character varying, "discord" character varying, "first_name" character varying, "last_name" character varying, "sur_name" character varying, "age" integer, "role" character varying NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `DELETE FROM "authorization_provider" WHERE "user_id" NOT IN (SELECT "id" FROM "user")`,
    );
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user_schema"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
