import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateOrganizationEmployeeDTO extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  employeeRole: string;
}
