import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1773067311144 implements MigrationInterface {
    name = 'Auto1773067311144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496"`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" DROP CONSTRAINT "FK_a2e45af8406489ff058f4f83f12"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_fafec2a7604ef9e0ccc328d7496" FOREIGN KEY ("toId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authorization_provider" ADD CONSTRAINT "FK_a2e45af8406489ff058f4f83f12" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
