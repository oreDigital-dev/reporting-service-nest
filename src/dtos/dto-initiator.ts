import { IsNotEmpty, NotEquals } from 'class-validator';
import { CreateAddressDTO } from './create-address.dto';

export class DTOInitiator {
  @IsNotEmpty()
  addresss: CreateAddressDTO;
}
