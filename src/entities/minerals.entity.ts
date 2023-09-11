import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { MineSite } from './minesite.entity';

@Entity('mineral')
export class Mineral extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: string = v4();

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'mineral_code' })
  mineralCode: string;

  @ManyToMany(() => MineSite, (mineSite) => mineSite.minerals)
  @JoinTable()
  mineSites: MineSite[];
}
