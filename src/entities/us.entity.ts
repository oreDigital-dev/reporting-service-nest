/* eslint-disable */
import {
  Entity,
  Column,
  JoinColumn,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { EGender } from 'src/enums/EGender.enum';
import { UUID } from 'crypto';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';

@Entity('users')
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
  profile_pic: string;

  @Column()
  password: string;

  @Column({
    nullable: true,
    name: 'activation_code',
  })
  activationCode: number;

  @Column()
  national_id: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @Column({
    enum: EAccountStatus,
    default: EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION],
  })
  status: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    activationCode: number,
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.gender = EGender[myGender];
    this.national_id = national_id;
    this.phonenumber = phonenumber;
    this.password = password;
    this.activationCode = activationCode;
  }
}
