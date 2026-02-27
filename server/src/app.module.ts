import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeormDatasource } from './configs/Database.config';
import DatabaseConfig from './configs/Database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { NotificationModule } from './notification/notification.module';
import UsernameConfig from './configs/Username.config';
import AvatarConfig from './configs/Avatar.config';
import GoogleConfig from './configs/Google.config';
import GithubConfig from './configs/Github.config';
import CookieConfig from './configs/Cookie.config';
import JWTConfig from './configs/JWT.config';
import WsConfig from './configs/Ws.config';

@Module({
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
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeormDatasource()),
    CommonModule,
    AuthorizationModule,
    NotificationModule,
  ],
})
export class AppModule {}
