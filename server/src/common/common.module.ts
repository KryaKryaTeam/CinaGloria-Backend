import { Global, Module, Provider } from '@nestjs/common';
import { BaseTokens, ReposTokens } from './Tokens';
import { EventDispatcher } from './application/events/EventDispatcher';
import { EventHandler } from './application/events/EventHandler';
import { DBContext } from './infrastructure/DBContext';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { AuthorizationProviderRepository } from './infrastructure/repositories/AuthorizationProviderRepository';
import { AuthorizationModule } from 'src/authorization/authorization.module';

const providers: Provider[] = [
  { provide: BaseTokens.EventDispatcher, useClass: EventDispatcher },
  { provide: BaseTokens.EventHandler, useClass: EventHandler },
  { provide: BaseTokens.DBContext, useClass: DBContext },
  { provide: ReposTokens.UserRepository, useClass: UserRepository },
  {
    provide: ReposTokens.AuthorizationProviderRepository,
    useClass: AuthorizationProviderRepository,
  },
];

@Global()
@Module({
  providers,
  exports: providers,
  imports: [AuthorizationModule],
})
export class CommonModule {}
