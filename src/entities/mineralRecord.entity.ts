import { UUID } from 'crypto';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { Company } from './company.entity';

@Entity('mineral_records')
export class MineralRecord extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'tagId' })
  tagId: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'measurement' })
  measurement: string;

  @ManyToMany(() => Company)
  companies: Company[];

  constructor(
    name: string,
    tagId: number,
    quantity: number,
    measurement: string,
  ) {
    super();
    this.name = name;
    this.tagId = tagId;
    this.quantity = quantity;
    this.measurement = measurement;
  }
}
