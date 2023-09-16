import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { MiningCompany } from './mining-company.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { User } from './us.entity';
import { Main } from './main.entity';
import { Notification } from './notification.entity';
import { Address } from './address.entity';

@Entity('employees')
export class MiningCompanyEmployee extends User {
  @Column({ default: 0 })
  salary: number;
  @Column({
    enum: EEmployeStatus,
    default: EEmployeStatus.ACTIVE,
  })
  employeeStatus: EEmployeStatus;

  @ManyToOne(() => MiningCompany)
  company: MiningCompany;

  @Column({ default: ECompanyRole.EMPLOYEE })
  role: ECompanyRole;

  @ManyToOne(() => Address, (address) => address.companyEmployees)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(
    () => Notification,
    (notification) => notification.companyEmployee0,
  )
  notifications: Notification[];

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
    activationNumber: number
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
      activationNumber
    );
    this.password = password;
  }
}
