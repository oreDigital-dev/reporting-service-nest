import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';
import { ApiProperty } from '@nestjs/swagger';

export class createMineSiteDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  minerals: Array<String>;

  @IsNotEmpty()
  @ApiProperty()
  address: CreateAddressDTO;
}
