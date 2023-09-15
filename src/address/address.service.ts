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

    const isAddressRegistered = await this.addressRepo.findOne({
      where: [
        {
          province: address.province,
          district: dto.district,
          sector: dto.sector,
          cell: dto.cell,
          village: dto.village,
        },
      ],
    });
    if (isAddressRegistered) return isAddressRegistered;
    return await this.addressRepo.save(address);
  }
}
