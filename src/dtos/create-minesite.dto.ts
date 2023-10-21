import { IsArray, IsNotEmpty, IsString, IsUUID, isUUID } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';

export class createMineSiteDTO {
  @IsUUID()
  @IsNotEmpty()
  concessionId: UUID;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  minerals: Array<string>;

  @IsNotEmpty()
  @ApiProperty()
  address: CreateAddressDTO;
}
