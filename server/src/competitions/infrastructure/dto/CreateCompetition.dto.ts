import {
  IsString,
  Length,
  IsISO8601,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ICreateCompetitionRAW } from 'src/competitions/domain/entities/Competition.entity';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';
import { Icons } from 'src/types/Icons';
import { CompetitionRuleDto } from './CompetitionRule.dto';

export class CreateCompetitionDto implements ICreateCompetitionRAW {
  @ApiProperty({ required: false, example: 'Summer Cup 2026' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name: string | null;

  @ApiProperty({ required: false, example: 'Description' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description: string | null;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  dateOfEnd: Date | null;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  dateOfEndRegistration: Date | null;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  dateOfStart: Date | null;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  dateOfStartRegistration: Date | null;

  @ApiProperty({
    type: [CompetitionRuleDto],
    required: false,
    example: [
      {
        name: 'name of Rule',
        desription: 'Hey this is rule!',
        icon: Icons.BOOK,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetitionRuleDto)
  rules: CompetitionRuleDto[];

  @InternalFileLink(false)
  @IsOptional()
  socialMedia: string | null;

  @InternalFileLink(false)
  @IsOptional()
  ultraWideBanner: string | null;

  @InternalFileLink(false)
  @IsOptional()
  avatar: string | null;

  @InternalFileLink(false)
  @IsOptional()
  banner: string | null;
}
