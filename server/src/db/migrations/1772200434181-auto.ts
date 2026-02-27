import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1772200434181 implements MigrationInterface {
    name = 'Auto1772200434181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a6e55b971f5fa8da9de60635a5"`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "from" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'SENDED', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "toId" uuid, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`CREATE INDEX "IDX_a6e55b971f5fa8da9de60635a5" ON "authorization_provider" ("type") `);
    }

}
