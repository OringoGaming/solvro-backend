import { DataSource } from 'typeorm'

export default new DataSource({
  type: 'postgres',
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: '_migrations',
});