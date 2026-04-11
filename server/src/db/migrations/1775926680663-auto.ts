import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1775926680663 implements MigrationInterface {
    name = 'Auto1775926680663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "settings" SET DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competition" ALTER COLUMN "settings" DROP DEFAULT`);
    }

}
