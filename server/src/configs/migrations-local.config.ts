import { join } from 'path';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'admin',
  database: 'CinaGloria',
  synchronize: false,
  migrations: [join(__dirname, '..', 'db', 'migrations', '*{.ts,.js}')],
  entities: [join(__dirname, '..', '**', '*.schema{.ts,.js}')],
});
