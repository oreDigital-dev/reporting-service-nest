import { UUID } from 'crypto';
import { ELocationType } from 'src/enums/ELocationType';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { combineAll } from 'rxjs';
import { MineSite } from './minesite.entity';
import { User } from './us.entity';

@Entity('Address')
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

  @OneToMany(() => Company, (company) => company.address)
  companies: Company[];

  @OneToMany(() => User, (user) => user.address)
  user: User[];
}
