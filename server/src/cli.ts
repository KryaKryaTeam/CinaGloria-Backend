import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(AppModule, ['error', 'warn', 'log']);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
