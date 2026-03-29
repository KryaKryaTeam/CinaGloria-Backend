import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1774781320433 implements MigrationInterface {
    name = 'Auto1774781320433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "toEmail" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "toEmail"`);
    }

}
