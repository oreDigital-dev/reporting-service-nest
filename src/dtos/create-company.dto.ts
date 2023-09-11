import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Address } from 'src/entities/address.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { CreateAddressDTO } from './create-address.dto';

export class CreateCompanyDTO {
  @IsString()
  name: string;
  @IsNotEmpty()
  ownership: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  ownerNID: string;
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  productionCapacity: number;

  mineralTypes: Array<String>;

  @IsNumber()
  @IsNotEmpty()
  licenseNumber: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfEmployees: number;

  @IsNotEmpty()
  address: CreateAddressDTO;
}
