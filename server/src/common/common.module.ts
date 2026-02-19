import { Global, Module, Provider } from '@nestjs/common';
import { BaseTokens } from './Tokens';
import { EventDispatcher } from './application/events/EventDispatcher';
import { EventHandler } from './application/events/EventHandler';
import { DBContext } from './infrastructure/DBContext';

const providers: Provider[] = [
  { provide: BaseTokens.EventDispatcher, useClass: EventDispatcher },
  { provide: BaseTokens.EventHandler, useClass: EventHandler },
  { provide: BaseTokens.DBContext, useClass: DBContext },
];

@Global()
@Module({
  providers,
  exports: providers,
})
export class CommonModule {}
