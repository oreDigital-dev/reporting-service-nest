import { ChildEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { MineSite } from './minesite.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { Mineral } from './mineral.entity';
import { Employee } from './employee.entity';
import { Address } from './address.entity';
import { UUID, randomUUID } from 'crypto';
import { Notification } from './notification.entity';

@Entity('mining_companies')
export class MiningCompany {

  @PrimaryColumn()
  id: UUID = randomUUID();
  
  @Column()
  name: string;
  @Column()
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @ManyToOne(() => Address, (address) => address.company)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => Notification, (notification) => notification.miningCompany)
  notifications: Notification[];

  @Column({
    name: 'owner_ship_type',
    default: EOwnershipType.PUBLIC,
  })
  ownershipType: EOwnershipType;

  @Column({ nullable: true })
  productionCapacity: number;

  @Column({ default: 0 })
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  @ManyToMany(() => MineSite)
  mineSites: MineSite[];

  @ManyToMany(() => Mineral)
  @JoinTable()
  minerals: Mineral[];


  constructor(name: string, email: string, phoneNumber: string, numberOfEmployees: number, ownershipType: EOwnershipType, productionCapacity: number, miniLicense : number ) {
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber
    this.numberOfEmployees = numberOfEmployees;
    this.ownershipType = ownershipType;
    this.productionCapacity = productionCapacity;
    this.miniLicense = miniLicense;
  }

}
