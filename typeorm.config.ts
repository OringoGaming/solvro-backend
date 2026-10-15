import { DataSource } from 'typeorm';
import "dotenv/config";

const host = process.env.DB_HOST
const port = parseInt(process.env.DB_PORT!);
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

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