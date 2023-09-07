import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { Company } from 'src/entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company) public companyRepo: Repository<Company>,
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
        this.companyRepo.save(company);
    }


}
