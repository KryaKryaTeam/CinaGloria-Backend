import { ILeaderboardNodeValue } from 'src/leaderboard/domain/objects/LeaderboardNode.object';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoundSchema } from './Round.schema';

@Entity({ name: 'leaderboard' })
export class LeaderboardSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb', default: '[]' })
  nodes: ILeaderboardNodeValue[];

  @OneToOne(() => RoundSchema, (round) => round.leaderboard)
  round: RoundSchema;
}
