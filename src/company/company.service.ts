import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressService } from 'src/address/address.service';
import { AuthService } from 'src/auth/auth.service';

import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { Address } from 'src/entities/address.entity';
import { Company } from 'src/entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company) public companyRepo: Repository<Company>,
        private addressService : AddressService,
        private authService : AuthService
     
    ){}
    async createCompany(dto: CreateCompanyDTO){
        const available = await this.companyRepo.findBy([{
            email : dto.email,
            ownerNID: dto.ownerNID,
            phoneNumber: dto.phoneNumber
        }]) 

        if(available) throw new BadRequestException("The company's phone number or email or owner NID is already regstered!")
        const hashedPassword = await this.authService.hashPassword(dto.password)
        let company: Company = new Company(dto);
        company.password = hashedPassword;
        let address : Address =await this.addressService.findById(dto.addressId);
        company.location =address;
        this.companyRepo.save(company);
    }

    async getCompanyById(id: string){
        return await this.companyRepo.findOneBy({
            id : id
        })
    }


}
