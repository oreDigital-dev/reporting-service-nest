import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';

export class CreateCompanyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: String;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ownership: EOwnershipType;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  email: any;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  ownerNID: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsStrongPassword()
  password: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  productionCapacity: number;
  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  mineralTypes: Array<String>;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  licenseNumber: number;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  numberOfEmployees: number;
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  addressId: UUID;
}
