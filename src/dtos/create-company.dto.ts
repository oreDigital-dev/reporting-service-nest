import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  ownership: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  ownerNID: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty()
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  productionCapacity: number;

  @ApiProperty()
  @IsNotEmpty()
  minerals: string[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  licenseNumber: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  numberOfEmployees: number;

  @IsNotEmpty()
  @Type(() => CreateAddressDTO)
  @ApiProperty()
  address: CreateAddressDTO;
}
