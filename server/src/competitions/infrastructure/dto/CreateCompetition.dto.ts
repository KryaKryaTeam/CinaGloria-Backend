import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsDate,
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
  name?: string;

  @ApiProperty({ required: false, example: 'Description' })
  @IsOptional()
  @IsString({ message: CompetitionErrors.RULE_DESCRIPTION_INVALID })
  description?: string;

  @ApiProperty({ required: false, example: '2026-08-30T12:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfEnd: Date | undefined;

  @ApiProperty({ required: false, example: '2026-08-10T12:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfEndRegistration: Date | undefined;

  @ApiProperty({ required: false, example: '2026-08-12T12:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfStart: Date | undefined;

  @ApiProperty({ required: false, example: '2026-08-01T12:00:00Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfStartRegistration: Date | undefined;

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
  socialMedia?: string;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  ultraWideBanner?: string;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  avatar?: string;

  @InternalFileLink(false)
  @IsOptional()
  @IsString()
  banner?: string;
}
