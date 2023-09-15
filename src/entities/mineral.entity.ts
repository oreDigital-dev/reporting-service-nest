import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Column, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { MineSite } from './minesite.entity';
import { UUID, randomUUID } from 'crypto';

@Entity('minerals')
export class Mineral extends InitiatorAudit {

  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column({
    unique: true,
    name: 'name',
  })
  name: string;
  @Column({
    name: 'mineral_code',
  })
  mineralCode: string;
  @Column({
    name: 'mineral_description',
  })
  mineralDescripption: string;

  @ManyToMany(() => MineSite, (mineral) => mineral.minerals)
  mineSites: MineSite[];

  constructor(name: string, mineralCode: string, mineralDescription: string) {
    super();
    this.name = name;
    this.mineralCode = mineralCode;
    this.mineralDescripption = mineralDescription;
  }
}
