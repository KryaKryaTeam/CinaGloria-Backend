import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorizationModule } from './authorization/authorization.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatasource } from './configs/Database.config';
import DatabaseConfig from './configs/Database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthorizationModule,
    ConfigModule.forRoot({
      load: [TypeormDatasource, DatabaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeormDatasource()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
