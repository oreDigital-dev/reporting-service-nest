/* eslint-disable */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  TableInheritance,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Role } from './role.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { File } from 'src/file/File';
import { UUID } from 'crypto';
import { Notification } from './notification.entity';
import { Address } from './address.entity';
import { Company } from './company.entity';
@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  phonenumber: string;

  @Column({
    nullable: true,
    default: null,
  })
  last_login: Date;

  @Column({
    nullable: false,
    default: EGender[EGender.OTHER],
  })
  gender: string;
  @JoinColumn({
    name: 'profile_picture',
  })
  profile_pic: File;

  @Column()
  password: string;

  @Column({
    nullable: true,
    name: 'activation_code',
  })
  activationCode: number;

  @Column()
  status: string;

  @Column({ name: 'organization_type', nullable: true })
  organizationType: string;

  @Column()
  national_id: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
  @ManyToMany(() => Company)
  @JoinTable()
  companies: Company[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @ManyToOne(() => User, (user) => user.address)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  setCompanies(company: any) {
    this.companies.push(company);
  }
  getCompanies(): Company[] {
    return this.companies;
  }
  constructor(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    status: EAccountStatus,
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.username = username;
    this.gender = EGender[myGender];
    this.national_id = national_id;
    this.phonenumber = phonenumber;
    this.password = password;
    this.status = EAccountStatus[status];
  }
}
