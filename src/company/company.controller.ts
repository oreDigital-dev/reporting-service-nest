import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { CompanyService } from './company.service';

@ApiTags('company')
@Controller('company')
export class CompanyController {

    constructor(
        private companyService : CompanyService
    ){}

    @Post('/create')
    createCompany(@Body() body: CreateCompanyDTO){
        return this.companyService.createCompany(body);
    }
}
