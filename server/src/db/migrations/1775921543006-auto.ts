import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775921543006 implements MigrationInterface {
    name = 'Auto1775921543006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" ADD "settings" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" DROP COLUMN "settings"`);
    }

}
