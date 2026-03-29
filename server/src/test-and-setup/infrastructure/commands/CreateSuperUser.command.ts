import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { CreateSuperUserCommand } from 'src/authorization/application/useCases/CreateSuperUser.command';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { CommandTokens } from 'src/common/Tokens';

@Command({
  name: 'create:admin',
  description: 'Create a superuser. If no args provided, uses config defaults.',
})
export class CreateAdminRunner extends CommandRunner implements OnModuleInit {
  private readonly logger = new Logger('Command');

  onModuleInit() {
    this.logger.log('Command initialized!');
  }

  constructor(
    @Inject(CommandTokens.CreateSuperUserCommand)
    private readonly createSuperUser: CreateSuperUserCommand,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    // 1. Спробуємо взяти аргументи з консолі
    let email = passedParams[0];
    let password = passedParams[1];

    // 2. Якщо аргументів немає, беремо з ConfigService
    if (!email || !password) {
      this.logger.log(
        'ℹ️ No arguments provided. Falling back to config defaults...',
      );

      email = this.configService.getOrThrow<string>('server.setup.email');
      password = this.configService.getOrThrow<string>('server.setup.password');
    }

    if (!email || !password) {
      this.logger.error(
        '❌ Error: Admin credentials not found in arguments or config.',
      );
      this.logger.log('Usage: npm run cli create:admin <email> <password>');
      return;
    }

    this.logger.log(`⏳ Creating superuser: ${email}...`);
    await this.createSuperUser.implementation({ email, password });
    this.logger.log(`✅ Success: Superuser ${email} created!`);
  }
}
