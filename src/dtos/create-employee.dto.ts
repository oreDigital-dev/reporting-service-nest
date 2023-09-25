import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class CreateEmployeeDTO extends CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  company: UUID;
}
