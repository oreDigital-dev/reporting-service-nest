import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { async } from 'rxjs';
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
      dto.province.toUpperCase(),
      dto.district.toUpperCase(),
      dto.sector.toUpperCase(),
      dto.cell.toUpperCase(),
      dto.village.toUpperCase(),
    );

    const isAddressRegistered = await this.addressRepo.findOne({
      where: [
        {
          province: address.province.toUpperCase(),
          district: dto.district.toUpperCase(),
          sector: dto.sector.toUpperCase(),
          cell: dto.cell.toUpperCase(),
          village: dto.village.toUpperCase(),
        },
      ],
    });
    if (isAddressRegistered) return isAddressRegistered;
    return await this.addressRepo.save(address);
  }

  createAddresses = async (addresses: CreateAddressDTO[]) => {
    let i = 0;
    let address1;
    let address2;
    addresses.forEach(async (dto) => {
      let addressEntity = new Address(
        dto.province,
        dto.district,
        dto.sector,
        dto.cell,
        dto.village,
      );

      const isAddressRegistered = await this.addressRepo.findOne({
        where: [
          {
            province: dto.province.toUpperCase(),
            district: dto.district.toUpperCase(),
            sector: dto.sector.toUpperCase(),
            cell: dto.cell.toUpperCase(),
            village: dto.village.toUpperCase(),
          },
        ],
      });
      if (isAddressRegistered && i == 0) {
        address1 = isAddressRegistered;
      } else if (isAddressRegistered && i == 1) {
        address2 = isAddressRegistered;
      } else {
        if (i == 0) {
          address1 = await this.addressRepo.save(addressEntity);
        } else {
          address2 = await this.addressRepo.save(addressEntity);
        }
      }

      i++;
    });
    return { address1, address2 };
  };
}
