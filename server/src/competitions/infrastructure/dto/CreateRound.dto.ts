import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';
import { ICreateRound } from 'src/competitions/domain/entities/Round.entity';
import { TaskEntity } from 'src/competitions/domain/entities/Task.entity';
import { Icons } from 'src/types/Icons';

export class CreateRoundInterDto implements ICreateRound {
  @ApiProperty({ example: 'Final Round' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Last stage of the competition' })
  @IsString()
  description: string;

  @ApiProperty({ enum: Icons, example: Icons.STAR })
  @IsEnum(Icons)
  icon: Icons;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  @IsDate()
  startOfRound: Date;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  @IsDate()
  taskTimeout: Date;

  @ApiProperty({ example: '2026-04-01T12:00:00.000Z' })
  @IsDate()
  endOfRound: Date;

  @Exclude()
  hidden: boolean = false;

  @Exclude()
  relatedTasks: TaskEntity[] = [];
}

export class CreateRoundDto {
  @ApiProperty({ example: 'baf84db4-ea01-493e-b7d3-647e7da2ec43' })
  @IsUUID()
  competitionId: string;

  @ApiProperty({ type: CreateRoundInterDto })
  round: CreateRoundInterDto;
}
