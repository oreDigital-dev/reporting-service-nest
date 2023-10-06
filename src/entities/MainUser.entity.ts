/* eslint-disable */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { EGender } from 'src/enums/EGender.enum';
import { UUID, randomUUID } from 'crypto';
import { Notification } from './notification.entity';
import { Address } from './address.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EEmployeeStatus } from 'src/enums/EEmployeeStatus.enum';
import { Organization } from './organization.entity';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';

@Entity('users')
export class MainUser extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phonenumber: string;

  @Column({ default: 0 })
  salary: number;

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
  profile_pic: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
    name: 'activation_code',
  })
  activationCode: number;

  @Column({
    default: EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION],
  })
  status: string;

  @Column()
  national_id: string;

  @ManyToMany(() => Organization)
  @JoinTable()
  organizations: Organization[];

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
  @Column({
    enum: EEmployeeStatus,
    default: EEmployeeStatus[EEmployeeStatus.PENDING],
  })
  employeeStatus: string;

  @Column({
    enum: EVisibilityStatus,
    default: EVisibilityStatus[EVisibilityStatus.VISIBLE],
  })
  visibility: string;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @ManyToOne(() => Address, (address) => address.miningCompanyEmployees)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
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
    this.gender = EGender[myGender];
    this.national_id = national_id;
    this.phonenumber = phonenumber;
    this.password = password;
    this.status = EAccountStatus[status];
  }
}
