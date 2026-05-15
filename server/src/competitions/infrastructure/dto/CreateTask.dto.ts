import { IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  descrpition: string;

  @IsString()
  color: string;

  @IsString()
  roundId: string;
}
