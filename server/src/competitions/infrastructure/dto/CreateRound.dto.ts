import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Icons } from 'src/types/Icons';

export class CreateRoundDto {
  @ApiProperty({ example: 'Final Round' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Last stage of the competition' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: Icons, example: Icons.STAR })
  @IsEnum(Icons)
  icon: Icons;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  @IsDate()
  startOfRound: Date;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  @IsDate()
  endOfRound: Date;

  @ApiProperty({ example: false })
  @IsBoolean()
  hidden: boolean;

  @ApiProperty({ example: 'baf84db4-ea01-493e-b7d3-647e7da2ec43' })
  @IsUUID()
  competitionId: string;
}
