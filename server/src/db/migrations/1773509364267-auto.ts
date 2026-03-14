import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1773509364267 implements MigrationInterface {
    name = 'Auto1773509364267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("url" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_ff5d246bb5831ad7351f87e67cb" PRIMARY KEY ("url"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
