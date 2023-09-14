import { UUID } from 'crypto';
import { createMineSiteDTO } from './create-minesite.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMineSiteDTO extends createMineSiteDTO {
  @IsNotEmpty()
  @ApiProperty()
  id: UUID;
}
