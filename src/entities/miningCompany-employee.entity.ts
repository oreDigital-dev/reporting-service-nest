import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EGender } from 'src/enums/EGender.enum';
import { MiningCompany } from './miningCompany.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { Address } from './address.entity';
import { MainUser } from './MainUser.entity';

@Entity('mining_company_employees')
export class MiningCompanyEmployee extends MainUser {
  @Column({ default: 0 })
  salary: number;

  @ManyToOne(() => MiningCompany)
  company: MiningCompany;

  @Column({ default: ECompanyRole[ECompanyRole.EMPLOYEE] })
  role: string;



  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    activationNumber: number,
    role: ECompanyRole
  ) {
    super(
      firstName,
      lastName,
      email,
      myGender,
      national_id,
      phonenumber,
      password,
      activationNumber,
    );
    this.role = ECompanyRole[role];
  }
}
