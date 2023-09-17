import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EGender } from 'src/enums/EGender.enum';
import { MiningCompany } from './miningCompany.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { Address } from './address.entity';
import { MainUser } from './MainUser.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';

@Entity('mining_company_employees')
export class MiningCompanyEmployee extends MainUser {
  @ManyToOne(() => MiningCompany)
  company: MiningCompany;

  @Column({ default: ECompanyRole[ECompanyRole.EMPLOYEE] })
  role: string;

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
    status: EAccountStatus,
    role: string,
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
    this.role = ECompanyRole[role];
  }
}
