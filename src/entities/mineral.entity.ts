import { UUID } from 'crypto';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Address } from './address.entity';
import { type } from 'os';

@Entity('mineral_records')
export class MineralRecord {
  @PrimaryColumn()
  id: UUID;

  @Column({ nullable: false, unique: true })
  tagId: number;

  quantity: number;
  measurement: String;
  @OneToOne((type) => Address)
  @JoinColumn({ name: 'address_id' })
  origin: Address;
}
