import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class ApproveOrRejectEmployeeDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  id: UUID;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  action: string;
}
