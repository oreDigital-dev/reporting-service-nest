import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './us.entity';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { MiningCompany } from './mining-company.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { Address } from './address.entity';
import { MainUser } from './MainUser.entity';

@Entity('mining_company_employees')
export class MiningCompanyEmployee extends MainUser {
  @ManyToOne(() => MiningCompany)
  company: MiningCompany;

  @Column({ default: ECompanyRole.EMPLOYEE })
  role: ECompanyRole;

  @OneToMany(() => Address, (address) => address.miningCompanyEmployees)
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
  ) {
    super(
      firstName,
      lastName,
      email,
      myGender,
      national_id,
      phonenumber,
      '',
      EAccountStatus.WAITING_EMAIL_VERIFICATION,
    );
    this.password = password;
  }
}
