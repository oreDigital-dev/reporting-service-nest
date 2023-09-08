import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';

@Entity('employess')
export class Employee extends User {
  @Column()
  email: String;
  @ManyToMany(() => Company)
  @JoinTable()
  companies: Company[];
  @Column('numeric')
  salary: number;
  @Column({
    type: String,
    enum: EEmployeStatus,
    default: EEmployeStatus[EEmployeStatus.ACTIVE],
  })
  employeeStatus: EEmployeStatus;

  constructor(
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    myGender: EGender,
    national_id: String,
    phonenumber: String,
    salary: number,
  ) {
    super(
      firstName,
      lastName,
      email,
      username,
      myGender,
      national_id,
      phonenumber,
      '',
      EAccountStatus.ACTIVE,
    );
    this.salary = salary;
  }

  setCompanies(company: any) {
    this.companies.push(company);
  }
  getCompanies(): Company[] {
    return this.companies;
  }
}
