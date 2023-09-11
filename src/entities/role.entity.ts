/* eslint-disable */
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './us.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { ERole } from 'src/enums/ERole.enum';

@Entity('roles')
export class Role extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    name: 'role_name',
    default: ERole[ERole.COMPANY_EMPLOYEE],
  })
  roleName: String;
  @ManyToMany(() => User)
  users: User[];
}
