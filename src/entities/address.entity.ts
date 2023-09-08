import { ELocationType } from 'src/enums/ELocationType';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { MineSite } from './minesite.entity';
import { User } from './us.entity';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column({ name: 'location_type' })
  locationType: ELocationType;

  @Column()
  name: string;

  @Column({ name: 'name_french' })
  nameFrench: string;

  @Column({ name: 'name_kiny' })
  nameKiny: string;

  @OneToMany(() => MineSite, (mineSite) => mineSite.address)
  mineSite: MineSite[];

  @ManyToOne((type) => Address)
  @JoinColumn({ name: 'parent_id' })
  parentId: Address;

  @OneToMany(() => User, (user) => user.address)
  user: User[];
}
