import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatasource } from './configs/Database.config';
import DatabaseConfig from './configs/Database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [TypeormDatasource, DatabaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeormDatasource()),
    CommonModule,
  ],
})
export class AppModule {}
