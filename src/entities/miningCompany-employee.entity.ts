import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EGender } from 'src/enums/EGender.enum';
import { MiningCompany } from './miningCompany.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { Address } from './address.entity';
import { MainUser } from './MainUser.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { Report } from './report.entity';

@Entity('mining_company_employees')
export class MiningCompanyEmployee extends MainUser {
  @ManyToOne(() => MiningCompany)
  @JoinColumn({ name: 'company_id' })
  company: MiningCompany;

  @Column({ default: ECompanyRole[ECompanyRole.EMPLOYEE] })
  role: string;

  @OneToMany(() => Address, (address) => address.miningCompanyEmployees)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => Report, (report) => report.owner)
  ownedReports: Report[];

  @ManyToOne(() => Report, (report) => report.victims)
  @JoinColumn({ name: 'report_id' })
  report: Report;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    status: EAccountStatus,
    actionCode: number,
  ) {
    super(
      firstName,
      lastName,
      email,
      myGender,
      national_id,
      phonenumber,
      password,
      status,
    );
    this.activationCode = actionCode;
  }
}
