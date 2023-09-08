import { UUID } from 'crypto';
import { ELocationType } from 'src/enums/ELocationType';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { combineAll } from 'rxjs';

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

  residentialAddress: Address[];

  @ManyToOne((type) => Address)
  @JoinColumn({ referencedColumnName: 'parent_id' })
  parentId: Address;

  // @Column()
  // @OneToMany(() => Company, (company) => company.location)
  // companies: Company[];
}
