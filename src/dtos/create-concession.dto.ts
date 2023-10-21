import { IsNotEmpty, IsString } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';

export class CreateConcessionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
  address: CreateAddressDTO;
}
