import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IPrivateProfile } from 'src/authorization/domain/entities/User.entity';
import { GetPublicProfileRes } from './GetPublicProfileRes';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

export class UserFullNameRes {
  @ApiProperty({
    example: 'John Doe Smith',
    description: 'The full concatenated name of the user',
  })
  value: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'User first name',
  })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'User last name',
  })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Smith',
    description: 'User patronymic or middle name (surName)',
  })
  surName?: string;
}

export class GetPrivateProfileRes
  extends GetPublicProfileRes
  implements IPrivateProfile
{
  @ApiProperty({ example: 'user@example.com', format: 'email' })
  email: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.values(AuthorizationProviderTypes),
    },
    example: [
      AuthorizationProviderTypes.LOCAL,
      AuthorizationProviderTypes.GOOGLE,
    ],
    description: 'List of connected authentication providers for this user',
  })
  authorizationProviders: string[];

  @ApiPropertyOptional({ example: 25 })
  age?: number;

  @ApiPropertyOptional({ type: UserFullNameRes })
  fullName?: UserFullNameRes;
}
