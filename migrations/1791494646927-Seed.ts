import { MigrationInterface, QueryRunner } from 'typeorm';

export class Seed1791494646927 implements MigrationInterface {
  name = 'Seed1791494646927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            INSERT INTO cocktail_category(name) 
            VALUES
            ('Other'),
            ('Whiskey'),
            ('Vodka'),
            ('Wine');
            `,
    );
    await queryRunner.query(
      `
            INSERT INTO ingredient(name, description, alcoholic)
            VALUES
            ('Vodka', 'A high proof neutral spirit.', true);
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            DELETE FROM cocktail_category as cc
            WHERE cc.name IN ('Other', 'Whiskey', 'Vodka', 'Wine');
            `,
    );
    await queryRunner.query(
      `
            DELETE FROM ingredient as i
            WHERE i.name = 'Vodka';
            `,
    );
  }
}
