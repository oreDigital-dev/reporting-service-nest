import { UUID } from 'crypto';
import { UpdateUserDto } from './update-user.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateRescueTeamEmployee extends UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: UUID;
}
