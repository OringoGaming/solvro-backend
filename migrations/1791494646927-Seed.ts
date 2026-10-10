import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1791494646927 implements MigrationInterface {
    name = 'Seed1791494646927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO cocktail_category(name) 
            VALUES
            ( 'Inne' ),
            ( 'Whiskey' ),
            ( 'Wódka' ),
            ( 'Wino' )
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM cocktail_category as cc
            WHERE cc.name IN ('Inne', 'Whiskey', 'Wódka', 'Wino')
            `
        );
    }

}

