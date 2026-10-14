import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1791494646926 implements MigrationInterface {
    name = 'Init1791494646926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cocktail_ingredient_unit_enum" AS ENUM('millilitre', 'piece', 'dashes', 'other')`);
        await queryRunner.query(`CREATE TABLE "cocktail_ingredient" ("cocktailId" uuid NOT NULL, "ingredientId" uuid NOT NULL, "unit" "public"."cocktail_ingredient_unit_enum" NOT NULL, "amount" numeric(2) NOT NULL, CONSTRAINT "PK_COCKTAIL_INGREDIENT" PRIMARY KEY ("cocktailId", "ingredientId"))`);
        await queryRunner.query(`CREATE TABLE "cocktail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "instruction" text NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "UQ_COCKTAIL_NAME" UNIQUE ("name"), CONSTRAINT "PK_2640ba026b49f47c99d3a3219c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text NOT NULL, "alcoholic" boolean NOT NULL, "imagePath" text, CONSTRAINT "UQ_INGREDIENT_NAME" UNIQUE ("name"), CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "passwordHash" text NOT NULL, CONSTRAINT "UQ_USER_EMAIL" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cocktail_category" ("id" SERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_COCKTAIL_CATEGORY_NAME" UNIQUE ("name"), CONSTRAINT "PK_f3c64a7b6f3fdd079861af74f21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6" FOREIGN KEY ("cocktailId") REFERENCES "cocktail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_COCKTAIL_INGREDIENT_INGREDIENT" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cocktail" ADD CONSTRAINT "FK_COCKTAIL_CATEGORY" FOREIGN KEY ("categoryId") REFERENCES "cocktail_category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cocktail" DROP CONSTRAINT "FK_COCKTAIL_CATEGORY"`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_COCKTAIL_INGREDIENT_INGREDIENT"`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6"`);
        await queryRunner.query(`DROP TABLE "cocktail_category"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "ingredient"`);
        await queryRunner.query(`DROP TABLE "cocktail"`);
        await queryRunner.query(`DROP TABLE "cocktail_ingredient"`);
        await queryRunner.query(`DROP TYPE "public"."cocktail_ingredient_unit_enum"`);
    }

}
