import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDTO extends CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  salary: number;

  @IsString()
  employeeRole: string;
}
