import {
  Body,
  Controller,
  Query,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RmbService } from './rmb.service';
import { ApiResponse } from 'src/payload/apiResponse';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateOrganizationEmployeeDTO } from 'src/dtos/createRMBEmploye.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('rmb')
@ApiTags('rmb')
export class RmbController {
  constructor(private rmbService: RmbService) {}
  @Get('employees/all')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  async getAllRMBEmployees() {
    return new ApiResponse(
      true,
      'All rmb employees retrieved successfully',
      await this.rmbService.getAllRMBEmployees(),
    );
  }

  @Post('create/rmb-employee')
  @Public()
  async createSytemAdmin(@Body() dto: CreateOrganizationEmployeeDTO) {
    const response = await this.rmbService.createSytemAdmin(dto);
    return new ApiResponse(true, response.message, response.admin);
  }

  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  @Delete('/delete-one/:id')
  async deleteRMBEmployee(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'All rmb empl deleted successfully',
      await this.rmbService.deleteRMBEmployee(id),
    );
  }

  @Delete('/delete-all')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  async deleteAllRMBEmployees(id: UUID) {
    return new ApiResponse(
      true,
      'All rmb employees were deleted successfully',
      await this.rmbService.deleteAllRMBEmployees(),
    );
  }

  @Put('/approve-or-reject')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  @ApiQuery({
    name: 'action',
    required: true,
    type: String,
    example: 'approve',
  })
  @ApiQuery({ name: 'id', required: true })
  async approveOrRejectRMBEmployee(
    @Query('action') action: string,
    @Query('id') id: UUID,
  ) {
    return new ApiResponse(
      true,
      'The employee was rejected successfully',
      await this.rmbService.approveOrRejectRMBEmployee(action, id),
    );
  }

  @Get('employees/all-by-status')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  @ApiQuery({
    name: 'status',
    required: true,
    type: String,
    example: 'pending',
  })
  async getAllRMBEmployeesByStatus(@Query('status') status: string) {
    return new ApiResponse(
      true,
      'The rmb employees retrieved successfully',
      await this.rmbService.getAllRMBEmployeesByStatus(status),
    );
  }
}
