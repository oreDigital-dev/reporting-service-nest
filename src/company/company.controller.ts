import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { ApiResponse } from 'src/payload/apiResponse';
import { Roles } from 'src/decorators/roles.decorator';
import { UUID } from 'crypto';
import { CreateMiningCompanyDTO } from 'src/dtos/create_mining-company.dto';

@UseInterceptors(ClassSerializerInterceptor)
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
  @Roles('SYSTEM_ADMIN', 'RMB_ADMIN')
  async getAllCompanies() {
    return new ApiResponse(
      true,
      'Companies retrieved sucessfully',
      await this.companyService.getAllCompanies(),
    );
  }

  @Get('/by-id')
  @ApiQuery({ name: 'id', required: true })
  async getCompanyById(@Query('id') id: UUID) {
    return new ApiResponse(
      true,
      'Data retrieval successfull',
      await this.companyService.getCompanyById(id),
    );
  }

  @Get('by-id')
  @Roles('SYSTEM_ADMIN, RMB_ADMIN')
  @ApiQuery({ name: 'id', required: true })
  async deleteCompany(@Query('id') id: UUID) {
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

  @Put('approve-or-reject/:action/:id')
  @Roles('SYSTEM_ADMIN', 'RMB_ADMIN')
  @ApiQuery({
    name: 'action',
    type: String,
    required: true,
    example: 'approve',
  })
  @ApiQuery({ name: 'id', required: true })
  async approveOrRejectCompany(
    @Query('action') action: string,
    @Query('id') id: UUID,
  ) {
    return new ApiResponse(
      true,
      'companies retrieved successfully',
      await this.companyService.approveOrRejectCompany(action, id),
    );
  }

  @Get('by-status')
  @Roles('SYSTEM_ADMIN', 'RMB_ADMIN')
  @ApiQuery({ name: 'status', type: String, example: 'pending' })
  async getCompaniesByStatus(@Query('status') status: string) {
    return new ApiResponse(
      true,
      'Companies retrieved successfully',
      await this.companyService.getCompaniesByStatus(status),
    );
  }
}
