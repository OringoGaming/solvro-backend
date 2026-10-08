import { DataSource } from 'typeorm'

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || "5432");
const username = process.env.DB_USERNAME || "postgres";
const password = process.env.DB_PASSWORD || "postgres";
const database = process.env.DB_DATABASE || "backend";

export default new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: '_migrations',
});