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
import { UUID } from 'crypto';

export class CreateCompanyDTO {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  gender: string;

  @IsNotEmpty()
  @ApiProperty()
  ownership: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

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
  minerals: UUID[];

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
