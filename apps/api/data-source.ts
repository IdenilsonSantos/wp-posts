import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [__dirname + `/${isProd ? '**/*.entity.js' : '**/*.entity.ts'}`],
  migrations: [
    __dirname + `/${isProd ? 'migrations/*.js' : 'migrations/*.ts'}`,
  ],
  synchronize: false,
  ssl: false,
});
