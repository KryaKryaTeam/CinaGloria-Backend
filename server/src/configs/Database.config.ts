import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

interface DatabaseConfig {
  password: string;
  user: string;
  name: string;
  port: number;
  version: number;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    name: process.env.DB_NAME ?? 'CinaGloria',
    password: process.env.DB_PASSWORD ?? 'admin',
    user: process.env.DB_USER ?? 'admin',
    port: Number(process.env.DB_PORT ?? '5432'),
    version: Number(process.env.DB_VERSION ?? '18'),
  }),
);

export const TypeormDatasource = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  port: Number(process.env.DB_PORT ?? '5432'),
  host: 'db',
  username: process.env.DB_USER ?? 'admin',
  password: process.env.DB_PASSWORD ?? 'admin',
  database: process.env.DB_NAME ?? 'CinaGloria',
  synchronize: process.env.NODE_ENV != 'PRODUCTION',
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
  entities: [join(__dirname, '/**/*.schema{.ts,.js}')],
  autoLoadEntities: true,
});
