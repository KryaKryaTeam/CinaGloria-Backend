import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { AuthorizationProviderMapper } from './application/mappers/AuthorizationProviderMapper';
import { UserMapper } from './application/mappers/UserMapper';
import { LoginCommand } from './application/useCases/LoginCommand.command';
import { AuthorizationProviderService } from './infrastructure/services/AuthorizationProviderService';
import { APP_GUARD, DiscoveryModule, DiscoveryService } from '@nestjs/core';
import { GoogleAuthorizationProvider } from './infrastructure/authorizationProviders/GoogleAuthorizationProvider';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { GithubAuthorizationProvider } from './infrastructure/authorizationProviders/GithubAuthorizationProvider';
import { JWTTokenService } from './infrastructure/services/JWTToken.service';
import { HashService } from './infrastructure/services/Hash.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalAuthorizationProvider } from './infrastructure/authorizationProviders/LocalAuthorizationProvider';
import { AuthGuard } from './infrastructure/guards/auth/auth.guard';
import { RefreshCommand } from './application/useCases/RefreshCommand.command';
import { GetPublicProfileQuery } from './application/useCases/GetPublicProfileQuery';
import { GetPrivateProfileQuery } from './application/useCases/GetPrivateProfileQuery';
import { UserController } from './infrastructure/controllers/user.controller';
import { UpdateAdditionalDataCommand } from './application/useCases/UpdateAdditionalDataCommand';
import { UpdateUsernameCommand } from './application/useCases/UpdateUsernameCommand';
import { UpdateAvatarCommand } from './application/useCases/UpdateAvatarCommand';

const providers: Provider[] = [
  {
    provide: MapperTokens.AuthorizationProviderMapper,
    useClass: AuthorizationProviderMapper,
  },
  {
    provide: MapperTokens.UserMapper,
    useClass: UserMapper,
  },
  {
    provide: CommandTokens.LoginCommand,
    useClass: LoginCommand,
  },
  {
    provide: CommandTokens.RefreshCommand,
    useClass: RefreshCommand,
  },
  {
    provide: ServiceTokens.AuthorizationProviderService,
    useClass: AuthorizationProviderService,
  },
  {
    provide: ServiceTokens.JWTService,
    useClass: JWTTokenService,
  },
  {
    provide: ServiceTokens.HashService,
    useClass: HashService,
  },
  {
    provide: CommandTokens.GetPublicProfileQuery,
    useClass: GetPublicProfileQuery,
  },
  {
    provide: CommandTokens.GetPrivateProfileQuery,
    useClass: GetPrivateProfileQuery,
  },
  {
    provide: CommandTokens.UpdateUserAdditionalDataCommand,
    useClass: UpdateAdditionalDataCommand,
  },
  {
    provide: CommandTokens.UpdateUsernameCommand,
    useClass: UpdateUsernameCommand,
  },
  {
    provide: CommandTokens.UpdateAvatarCommand,
    useClass: UpdateAvatarCommand,
  },
  DiscoveryService,
  GoogleAuthorizationProvider,
  GithubAuthorizationProvider,
  LocalAuthorizationProvider,
  {
    provide: ServiceTokens.JWTService,
    useClass: JWTTokenService,
  },
];

@Module({
  providers: [
    ...providers,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [DiscoveryModule, JwtModule.register({})],
  exports: [...providers],
  controllers: [AuthController, UserController],
})
export class AuthorizationModule {}
