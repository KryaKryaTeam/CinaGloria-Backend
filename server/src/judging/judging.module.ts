import { Module } from '@nestjs/common';
import { MapperTokens } from 'src/common/Tokens';
import { ScoreMapper } from './appliaction/mapper/ScoreMapper';

const providers = [
  { provide: MapperTokens.ScoreMapper, useClass: ScoreMapper },
];

@Module({
  providers,
  exports: [...providers],
})
export class JudgingModule {}
