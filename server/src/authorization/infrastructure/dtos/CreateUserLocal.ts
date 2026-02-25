import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateUserLocal {
  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false, example: 'example@localhost.com' })
  email: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  )
  @IsOptional()
  @ApiProperty({ required: false, example: '123Ac&44' })
  password: string;

  constructor(partial: Partial<CreateUserLocal>) {
    Object.assign(this, partial);
  }
}
