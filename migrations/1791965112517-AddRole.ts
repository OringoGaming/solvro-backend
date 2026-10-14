import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRole1791965112517 implements MigrationInterface {
    name = 'AddRole1791965112517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cocktail" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cocktail" ADD CONSTRAINT "FK_be9a7563bdcf9f9de2f339e09a3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cocktail" DROP CONSTRAINT "FK_be9a7563bdcf9f9de2f339e09a3"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "cocktail" DROP COLUMN "userId"`);
    }

}
