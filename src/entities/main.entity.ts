/* eslint-disable */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { EGender } from 'src/enums/EGender.enum';
import { File } from 'src/file/File';
import { UUID } from 'crypto';
import { Notification } from './notification.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EUserStatus } from 'src/enums/EUserStatus.enum';

@Entity('users')
export class Main extends InitiatorAudit {
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

  @Column()
  national_id: string;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  //   @OneToMany(() => Notification, (notification) => notification.user)
  //   notifications: Notification[];

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    status: EUserStatus,
  ) {
    super();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.gender = EGender[myGender];
    this.national_id = national_id;
    this.phonenumber = phonenumber;
    this.password = password;
    this.status = EUserStatus[status];
  }
}