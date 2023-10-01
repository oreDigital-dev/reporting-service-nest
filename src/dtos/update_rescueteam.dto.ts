import { UUID } from 'crypto';
import { CreateRescueDTO } from './create_rescue.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateRescueTeam extends CreateRescueDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: UUID;
}
