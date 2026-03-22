import type { ICompetitionRule } from 'src/competitions/domain/objects/CompetitionRule.object';
import { CompetitionStatus } from '../types/CompetitionStatus';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'competition',
  orderBy: {
    createdAt: 'ASC',
  },
})
export class CompetitionSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  ultraWideBanner: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  socialMedia: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStart: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEnd: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStartRegistration: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEndRegistration: Date;

  @Column({ type: 'jsonb', default: [] })
  rules: ICompetitionRule[];

  @Column({ enum: CompetitionStatus, enumName: 'competition_status' })
  status: CompetitionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
