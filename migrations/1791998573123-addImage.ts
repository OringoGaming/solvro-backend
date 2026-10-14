import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImage1791998573123 implements MigrationInterface {
    name = 'AddImage1791998573123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ingredient_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" bytea NOT NULL, "mimeType" text NOT NULL, CONSTRAINT "PK_db8b69e5cdff4c0da75fb67e6be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "imagePath"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "imagePath" text`);
        await queryRunner.query(`DROP TABLE "ingredient_image"`);
    }

}
