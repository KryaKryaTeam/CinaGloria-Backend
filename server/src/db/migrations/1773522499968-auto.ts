import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1773522499968 implements MigrationInterface {
    name = 'Auto1773522499968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_relation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "file_url" character varying, CONSTRAINT "PK_0d310c9c9f5eea4263cc8deee4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8" FOREIGN KEY ("file_url") REFERENCES "file"("url") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_ebb0baeeabc8f72c742ce0f283e"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_f08036056ca7e96e8028b5ac2f8"`);
        await queryRunner.query(`DROP TABLE "file_relation"`);
    }

}
