import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774526882641 implements MigrationInterface {
    name = 'Auto1774526882641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ADD "slot" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD "competition_id" uuid`);
        await queryRunner.query(`ALTER TABLE "file_relation" ADD CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP CONSTRAINT "FK_7ffc961e62f5138dc8f8ab50d69"`);
        await queryRunner.query(`ALTER TABLE "file_relation" DROP COLUMN "competition_id"`);
        await queryRunner.query(`ALTER TABLE "file" DROP COLUMN "slot"`);
    }

}
