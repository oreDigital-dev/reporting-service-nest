import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { ApiResponse } from 'src/payload/apiResponse';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UUID } from 'crypto';
import { CreateMiningCompanyDTO } from 'src/dtos/create_mining-company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('/create')
  async createCompany(@Body() body: CreateMiningCompanyDTO) {
    const company = await this.companyService.createCompany(body);
    return new ApiResponse(
      true,
      `Thank you for request a workspace at oreDigital, please go and verifiy your email`,
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
  async getCompanyProfile() {
    return new ApiResponse(
      true,
      'Data retrieval successfull',
      await this.companyService.getCompanyProfile,
    );
  }
}
