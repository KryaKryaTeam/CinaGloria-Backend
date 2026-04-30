import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Icons } from 'src/types/Icons';

export class PatchRoundDto {
  @ApiProperty({ example: '0e246897-5f08-488b-a3e4-fe329359d3af' })
  @IsUUID()
  roundId: string;

  @ApiProperty({ example: 'Round 1' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Description for round 1' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '3000-04-08T12:00:00.000Z' })
  @IsOptional()
  @IsDate()
  startOfRound?: Date;

  @ApiProperty({ example: '3010-05-08T12:00:00.000Z' })
  @IsOptional()
  @IsDate()
  endOfRound?: Date;

  @ApiProperty({ example: '3010-05-08T12:00:00.000Z' })
  @IsOptional()
  @IsDate()
  taskTimeout?: Date;

  @ApiProperty({ example: Icons.STAR, enum: Icons })
  @IsOptional()
  @IsEnum(Icons)
  icon?: Icons;
}
