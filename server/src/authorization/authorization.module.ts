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
import { CheckCommand } from './application/useCases/CheckCommand.command';
import { JWTTokenService } from './infrastructure/services/JWTToken.service';
import { HashService } from './infrastructure/services/Hash.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalAuthorizationProvider } from './infrastructure/authorizationProviders/LocalAuthorizationProvider';
import { AuthGuard } from './infrastructure/guards/auth/auth.guard';

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
    provide: CommandTokens.CheckCommand,
    useClass: CheckCommand,
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
  controllers: [AuthController],
})
export class AuthorizationModule {}
