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

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  ultraWideBanner: string | null;

  @Column({ type: 'varchar', nullable: true })
  banner: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', nullable: true })
  socialMedia: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStart: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEnd: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfStartRegistration: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  dateOfEndRegistration: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishAt: Date | null;

  @Column({ type: 'jsonb', default: [] })
  rules: ICompetitionRule[];

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    enumName: 'competition_status',
  })
  status: CompetitionStatus;

  @CreateDateColumn()
  createdAt: Date;
}
