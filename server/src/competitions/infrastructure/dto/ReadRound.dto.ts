import { IsUUID } from 'class-validator';

export class ReadRoundDto {
  @IsUUID()
  id: string;
}
