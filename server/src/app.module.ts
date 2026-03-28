import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatasource } from './configs/Database.config';
import DatabaseConfig from './configs/Database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { NotificationModule } from './notification/notification.module';
import { FilesModule } from './files/files.module';
import UsernameConfig from './configs/Username.config';
import AvatarConfig from './configs/Avatar.config';
import GoogleConfig from './configs/Google.config';
import GithubConfig from './configs/Github.config';
import CookieConfig from './configs/Cookie.config';
import JWTConfig from './configs/JWT.config';
import WsConfig from './configs/Ws.config';
import MailConfig from './configs/Mail.config';
import ServerConfig from './configs/Server.config';
import StorageConfig, { ServeStaticConfig } from './configs/Storage.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CompetitionsModule } from './competitions/competitions.module';
import { APP_FILTER } from '@nestjs/core';
import { ApiErrorExceptionsFilter } from './error/ApiError.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiErrorExceptionsFilter,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [
        TypeormDatasource,
        DatabaseConfig,
        UsernameConfig,
        AvatarConfig,
        GoogleConfig,
        GithubConfig,
        CookieConfig,
        WsConfig,
        JWTConfig,
        MailConfig,
        ServerConfig,
        StorageConfig,
        ServeStaticConfig,
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeormDatasource()),
    CommonModule,
    AuthorizationModule,
    NotificationModule,
    FilesModule,
    ServeStaticModule.forRoot(ServeStaticConfig()),
    CompetitionsModule,
  ],
})
export class AppModule {}
