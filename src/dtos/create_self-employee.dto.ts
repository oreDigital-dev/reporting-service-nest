import { UUID } from 'crypto';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatESelfEmployeeDTO extends CreateUserDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  orgId: UUID;
}
