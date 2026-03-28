import {
  IsString,
  IsISO8601,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ICreateCompetitionRAW } from 'src/competitions/domain/entities/Competition.entity';
import { InternalFileLink } from 'src/files/infrastructure/decorators/InternalFileLink.decorator';
import { CompetitionRuleDto } from './CompetitionRule.dto';
import { CompetitionErrors } from 'src/error/ApiError'; // Імпортуємо твої коди

export class CreateCompetitionDto implements ICreateCompetitionRAW {
  @ApiProperty({ required: false, example: 'Summer Cup 2026' })
  @IsOptional()
  @IsString({ message: CompetitionErrors.RULE_NAME_INVALID })
  name: string | null;

  @ApiProperty({ required: false, example: 'Description' })
  @IsOptional()
  @IsString({ message: CompetitionErrors.RULE_DESCRIPTION_INVALID })
  description: string | null;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsISO8601({}, { message: 'INVALID_DATE_FORMAT' })
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
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompetitionRuleDto)
  rules: CompetitionRuleDto[];

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  socialMedia: string | null;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  ultraWideBanner: string | null;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  avatar: string | null;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  banner: string | null;
}
