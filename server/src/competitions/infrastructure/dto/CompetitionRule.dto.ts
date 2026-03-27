import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Icons } from 'src/types/Icons';

export class CompetitionRuleDto {
  @ApiProperty({ type: 'string', example: 'Name of rule' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', example: 'Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ enum: Icons, enumName: 'icons' })
  @IsNotEmpty()
  @IsEnum(Icons)
  icon: string;
}
