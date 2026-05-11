import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';

export class RegistrationQuery {
  @ApiProperty({
    enum: AuthorizationProviderTypes,
    enumName: 'AuthorizationProviderTypes',
    description:
      'Specify which authorization provider to use. Currently only LOCAL is supported for this flow.',
    example: AuthorizationProviderTypes.LOCAL,
  })
  @IsEnum(AuthorizationProviderTypes)
  @IsNotEmpty()
  provider: AuthorizationProviderTypes.LOCAL;

  @ApiProperty({
    name: 'state',
    description:
      'CSRF protection code used to maintain state between the request and the callback',
    example: 'a-randomly-generated-uuid-or-string',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  constructor(partial: Partial<RegistrationQuery>) {
    Object.assign(this, partial);
  }
}
