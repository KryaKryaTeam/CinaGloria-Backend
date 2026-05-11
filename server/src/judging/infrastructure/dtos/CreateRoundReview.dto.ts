import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateRoundReviewDto {
  @IsNumber()
  @ApiProperty({
    example: 100,
    description: 'A summary of all the scores the team got in this round',
  })
  summary: number;

  @IsString()
  @ApiProperty({
    example: 'hello world',
    description: 'A description of the review. Could be anything you wish',
  })
  description: string;

  @IsUUID()
  @ApiProperty({
    example: '67d180fc-6757-4118-8923-fe6dce0adf4e',
    description: 'UUID of jury who was reviewing the submission',
  })
  byJury: string;

  @IsUUID()
  @ApiProperty({
    example: '9979d642-edf2-498d-9e87-ecfb503787ee',
    description: 'UUID of the round that was in review',
  })
  round: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({
    example: [
      '335cdcbd-0372-4a6c-9528-af85be53eab2',
      '004b1088-0f42-470d-8d1f-e83517595a7e',
    ],
    description: 'An array of UUIDs for the scores (each task)',
  })
  relatedScores: string[];

  @IsUUID()
  @ApiProperty({
    example: '02358d0c-8f40-4e87-adff-d86fa14f6074',
    description: 'UUID of a submission in review.',
  })
  submission: string;
}
