import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { CreateAddressDTO } from './create-address.dto';
import { CreateMineralDTO } from './create-mineral.dto';

export class CreateCompanyDTO {
  @IsString()
  name: string;

  @IsNotEmpty()
  ownership: string;

  @IsString()
  email: any;

  @IsString()
  @IsNotEmpty()
  ownerNID: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  phoneNumber: string;

  productionCapacity: string;

  @Type(()=> CreateMineralDTO)
  minerals : CreateMineralDTO[];

  @IsNumber()
  @IsNotEmpty()
  licenseNumber: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfEmployees: number;


  @IsNotEmpty()
  @Type(()=> CreateAddressDTO)
  address: CreateAddressDTO;
}
