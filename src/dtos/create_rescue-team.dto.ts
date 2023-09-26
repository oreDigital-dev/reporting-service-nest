import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { CreateRescueDTO } from './create_rescue.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRescueTeamDTO {
  @Type(() => CreateUserDto)
  @ApiProperty()
  RescueTeamAdmin: CreateUserDto;

  @Type(() => CreateRescueDTO)
  @ApiProperty()
  rescueTeam: CreateRescueDTO;
}
