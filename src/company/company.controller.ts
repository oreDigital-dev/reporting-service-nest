import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { CompanyService } from './company.service';
import { ApiResponse } from 'src/payload/apiResponse';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { Roles } from 'src/utils/decorators/roles.decorator';

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
}
