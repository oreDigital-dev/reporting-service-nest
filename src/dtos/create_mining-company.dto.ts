import { CreateCompanyDTO } from './create-company.dto';
import { CreateUserDto } from './create-user.dto';

export class CreateMiningCompanyDTO {
  companyAdmin: CreateUserDto;
  company: CreateCompanyDTO;
}
