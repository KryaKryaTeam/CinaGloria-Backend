import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IPublicProfile } from 'src/authorization/domain/entities/User.entity';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RoleEnum } from 'src/types/RoleEnum';

// Окремий клас для вкладених об'єктів дозволяє Swagger побудувати схему
export class UserContactsRes {
  @ApiPropertyOptional({ example: '@username', description: 'Telegram handle' })
  telegram?: string;

  @ApiPropertyOptional({
    example: 'username#1234',
    description: 'Discord username',
  })
  discord?: string;
}

export class GetPublicProfileRes implements IPublicProfile {
  @ApiProperty({
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatars/1.png',
    format: 'uri',
  })
  avatarURL: InternalFile;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.USER })
  role: RoleEnum;

  @ApiProperty({ type: UserContactsRes })
  contacts: UserContactsRes;
}
