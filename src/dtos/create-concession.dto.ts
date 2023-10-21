import { IsNotEmpty, IsString } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConcessionDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @ApiProperty()
  address: CreateAddressDTO;
}
