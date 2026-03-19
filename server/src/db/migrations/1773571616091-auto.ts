import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1773571616091 implements MigrationInterface {
    name = 'Auto1773571616091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" ADD "slot" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_relation" DROP COLUMN "slot"`);
    }

}
