import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1772299647718 implements MigrationInterface {
    name = 'Auto1772299647718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "age" TO "birth_day"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birth_day"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "birth_day" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birth_day"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "birth_day" integer`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "birth_day" TO "age"`);
    }

}
