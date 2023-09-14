import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { CompanyService } from './company.service';
import { ApiResponse } from 'src/payload/apiResponse';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UUID } from 'crypto';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('/create')
  async createCompany(@Body() body: CreateCompanyDTO) {
    const company = await this.companyService.createCompany(body);
    return new ApiResponse(
      true,
      'Company workspace created successfully',
      company,
    );
  }

  @Get('/all')
  @Roles('SYSTEM_ADMIN')
  async getAllCompanies() {
    return new ApiResponse(
      true,
      'Companies retrieved sucessfully',
      await this.companyService.getAllCompanies(),
    );
  }

  @Get('/id')
  @Roles('SYSTEM_ADMIN, COMPANY_ADMIN')
  async getCompanyById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'Data retrieval successfull',
      await this.companyService.getCompanyById(id),
    );
  }

  @Get('/id')
  @Roles('SYSTEM_ADMIN, COMPANY_ADMIN')
  async deleteCompany(@Param('id') id: UUID) {
    // return new ApiResponse(
    //   // true, 'Data retrieval successfull', await this.companyService.deleteCompany(id)
    // )
  }

  @Get('/profile')
  async getCompanyProfile(){
    return new ApiResponse(
      true, 'Data retrieval successfull', await this.companyService.getCompanyProfile
    )
  }

  
  

}
