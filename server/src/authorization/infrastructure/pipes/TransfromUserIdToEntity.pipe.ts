import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Inject,
} from '@nestjs/common';
import { UserEntity } from 'src/authorization/domain/entities/User.entity';
import type { IUserRepository } from 'src/authorization/application/bounds/IUserRepository';
import { ReposTokens } from 'src/common/Tokens';
import { ApiError, UserErrors } from 'src/error/ApiError';

@Injectable()
export class TransfromUserIdtoEntity implements PipeTransform {
  constructor(
    @Inject(ReposTokens.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype !== UserEntity) {
      return value as unknown;
    }

    const userId =
      typeof value === 'string'
        ? value
        : (value as unknown as { id?: string })?.id;

    if (!userId) return null;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      ApiError.throw(UserErrors.USER_WITH_THIS_ID_UNDEFINED);
    }

    return user;
  }
}
