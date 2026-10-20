import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1792525190204 implements MigrationInterface {
    name = 'InitSchema1792525190204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cocktail" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "instruction" character varying(10000) NOT NULL, "categoryId" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "UQ_COCKTAIL_NAME" UNIQUE ("name"), CONSTRAINT "PK_2640ba026b49f47c99d3a3219c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cocktail_ingredient_unit_enum" AS ENUM('millilitre', 'piece', 'dashes', 'other')`);
        await queryRunner.query(`CREATE TABLE "cocktail_ingredient" ("cocktailId" uuid NOT NULL, "ingredientId" uuid NOT NULL, "unit" "public"."cocktail_ingredient_unit_enum" NOT NULL, "amount" numeric(6,2) NOT NULL, CONSTRAINT "PK_COCKTAIL_INGREDIENT" PRIMARY KEY ("cocktailId", "ingredientId"))`);
        await queryRunner.query(`CREATE TABLE "cocktail_category" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "UQ_COCKTAIL_CATEGORY_NAME" UNIQUE ("name"), CONSTRAINT "PK_f3c64a7b6f3fdd079861af74f21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" character varying(10000) NOT NULL, "alcoholic" boolean NOT NULL, CONSTRAINT "UQ_INGREDIENT_NAME" UNIQUE ("name"), CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ingredient_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" bytea NOT NULL, "mimeType" text NOT NULL, "ingredientId" uuid NOT NULL, CONSTRAINT "REL_d5ba8d20b45fe437a7f32255bc" UNIQUE ("ingredientId"), CONSTRAINT "PK_db8b69e5cdff4c0da75fb67e6be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "role" "public"."user_role_enum" NOT NULL, "passwordHash" text NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cocktail" ADD CONSTRAINT "FK_COCKTAIL_CATEGORY" FOREIGN KEY ("categoryId") REFERENCES "cocktail_category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cocktail" ADD CONSTRAINT "FK_COCKTAIL_USER" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6" FOREIGN KEY ("cocktailId") REFERENCES "cocktail"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" ADD CONSTRAINT "FK_COCKTAIL_INGREDIENT_INGREDIENT" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient_image" ADD CONSTRAINT "FK_INGREDIENT_IMAGE" FOREIGN KEY ("ingredientId") REFERENCES "ingredient"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient_image" DROP CONSTRAINT "FK_INGREDIENT_IMAGE"`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_COCKTAIL_INGREDIENT_INGREDIENT"`);
        await queryRunner.query(`ALTER TABLE "cocktail_ingredient" DROP CONSTRAINT "FK_bec9000eefdab5c8b5a8b9fc8a6"`);
        await queryRunner.query(`ALTER TABLE "cocktail" DROP CONSTRAINT "FK_COCKTAIL_USER"`);
        await queryRunner.query(`ALTER TABLE "cocktail" DROP CONSTRAINT "FK_COCKTAIL_CATEGORY"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "ingredient_image"`);
        await queryRunner.query(`DROP TABLE "ingredient"`);
        await queryRunner.query(`DROP TABLE "cocktail_category"`);
        await queryRunner.query(`DROP TABLE "cocktail_ingredient"`);
        await queryRunner.query(`DROP TYPE "public"."cocktail_ingredient_unit_enum"`);
        await queryRunner.query(`DROP TABLE "cocktail"`);
    }

}
