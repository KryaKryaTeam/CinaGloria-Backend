import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatasource } from './configs/Database.config';
import DatabaseConfig from './configs/Database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthorizationModule } from './authorization/authorization.module';
import UsernameConfig from './configs/Username.config';
import AvatarConfig from './configs/Avatar.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [TypeormDatasource, DatabaseConfig, UsernameConfig, AvatarConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeormDatasource()),
    CommonModule,
    AuthorizationModule,
  ],
})
export class AppModule {}
