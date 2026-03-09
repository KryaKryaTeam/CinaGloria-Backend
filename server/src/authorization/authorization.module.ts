import { Module, Provider } from '@nestjs/common';
import { CommandTokens, MapperTokens, ServiceTokens } from 'src/common/Tokens';
import { AuthorizationProviderMapper } from './application/mappers/AuthorizationProviderMapper';
import { UserMapper } from './application/mappers/UserMapper';
import { LoginCommand } from './application/useCases/LoginCommand';
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
import { RoleGuard } from './infrastructure/guards/role/role.guard';
import { RefreshCommand } from './application/useCases/RefreshCommand';
import { GetPublicProfileQuery } from './application/useCases/GetPublicProfileQuery';
import { GetPrivateProfileQuery } from './application/useCases/GetPrivateProfileQuery';
import { UserController } from './infrastructure/controllers/user.controller';
import { UpdateAdditionalDataCommand } from './application/useCases/UpdateAdditionalDataCommand';
import { UpdateUsernameCommand } from './application/useCases/UpdateUsernameCommand';
import { UpdateAvatarCommand } from './application/useCases/UpdateAvatarCommand';
import { GetCSRFToken } from './application/useCases/GetCSRFToken';
import { RegistrationCommand } from './application/useCases/RegistrationCommand';
import { UserCreatedHandler } from './infrastructure/handlers/UserCreatedEventHandler';
import { CacheModule } from '@nestjs/cache-manager';
import { ValidateRegistrationCommand } from './application/useCases/ValidateRegistrationCommand';

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
    provide: CommandTokens.RegistarationCommand,
    useClass: RegistrationCommand,
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
  {
    provide: CommandTokens.GetCSRFToken,
    useClass: GetCSRFToken,
  },
  {
    provide: CommandTokens.ValidateRegistrationCommand,
    useClass: ValidateRegistrationCommand,
  },
  DiscoveryService,
  GoogleAuthorizationProvider,
  GithubAuthorizationProvider,
  LocalAuthorizationProvider,
  UserCreatedHandler,
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
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  imports: [DiscoveryModule, JwtModule.register({}), CacheModule.register()],
  exports: [...providers],
  controllers: [AuthController, UserController],
})
export class AuthorizationModule {}
