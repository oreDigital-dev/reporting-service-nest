import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEmployeeDTO } from './create-employee.dto';
import { UUID } from 'crypto';

export class UpdateEmployeeDTO extends CreateEmployeeDTO {
  // @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  id: any;
}
