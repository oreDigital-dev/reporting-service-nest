import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {

    constructor(
        @InjectRepository(Address) public addressRepo : Repository<Address>
    ){}

    async findById(id: number){
        return this.addressRepo.findOneBy({id: id})
    }
}
