import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TeamStatus } from 'src/types/TeamStatus';

export class TeamSearchParamsDto {
  @ApiPropertyOptional({
    description: 'The name of the team to search for',
    example: 'Dream Team',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Minimum number of members in the team',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minMembers?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of members allowed in the team',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100)
  maxMembers?: number;

  @ApiPropertyOptional({
    description: 'Filter teams where the current user is the captain',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value as boolean;
  })
  isCaptain?: boolean;

  @ApiPropertyOptional({
    enum: TeamStatus,
    description: 'Filter teams by their current activity status',
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;

  @ApiPropertyOptional({
    description: 'Filter teams that have pending member invites',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === '1')
  hasInvites?: boolean;
}
