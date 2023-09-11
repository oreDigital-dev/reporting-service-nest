import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDTO } from 'src/dtos/create-address.dto';
import { Address } from 'src/entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) public addressRepo: Repository<Address>,
  ) {}

  async findById(id: any) {
    return this.addressRepo.findOne({
      where: { id: id },
    });
  }

  async createAddress(dto: CreateAddressDTO) {
    let address = new Address(
      dto.province,
      dto.district,
      dto.sector,
      dto.cell,
      dto.village,
    );
    return await this.addressRepo.save(address);
  }
}
