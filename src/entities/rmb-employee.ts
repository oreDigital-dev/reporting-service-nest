import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MainUser } from './MainUser.entity';
import { Address } from './address.entity';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
@Entity('rmb_employees')
export class RMBEmployee extends MainUser {
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
