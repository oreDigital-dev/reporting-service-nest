import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';

export class CreateOrganizationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @Type(() => CreateAddressDTO)
  @ApiProperty()
  address: CreateAddressDTO;
}
