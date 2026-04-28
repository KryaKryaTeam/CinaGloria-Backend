import { Icons } from 'src/types/Icons';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'criteria' })
export class CriteriaSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  visibility: boolean;

  @Column({ enum: Icons })
  icon: Icons;
}
