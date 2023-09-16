import { Type } from 'class-transformer';
import { CreateCompanyDTO } from './create-company.dto';
import { CreateUserDto } from './create-user.dto';

export class CreateMiningCompanyDTO {
 
  @Type(() => CreateUserDto)
  companyAdmin: CreateUserDto;

  @Type(() => CreateCompanyDTO)
  company: CreateCompanyDTO;

}
