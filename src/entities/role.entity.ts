/* eslint-disable */
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { ERole } from '../enums/ERole.enum';
import { UUID, randomUUID } from 'crypto';

@Entity('roles')
export class Role extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();
  @Column({
    name: 'role_name',
    default: ERole[ERole.COMPANY_EMPLOYEE],
  })
  roleName: String;
  // @ManyToMany(() => User)
  // employees: User[];
}
