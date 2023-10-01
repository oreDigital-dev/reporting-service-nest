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
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { CreateOrganizationEmployeeDTO } from 'src/dtos/createRMBEmploye.dto';

@Controller('rmb')
@ApiTags('rmb')
export class RmbController {
  constructor(private rmbService: RmbService) {}
  @Get('/all')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  async getAllRMBEmployees() {
    return new ApiResponse(
      true,
      'All rmb employees retrieved successfully',
      await this.rmbService.getAllRMBEmployees(),
    );
  }

  @Post('create/rmb-employee')
  async createSytemAdmin() {
    const response = await this.rmbService.createSytemAdmin(null);
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

  @Put('/approve-or-reject/:action/:id')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  async approveOrRejectRMBEmployee(
    @Param('action') action: string,
    @Param('id') id: UUID,
  ) {
    return new ApiResponse(
      true,
      'The employee was rejected successfully',
      await this.rmbService.approveOrRejectRMBEmployee(action, id),
    );
  }

  @Get('/all-by-status/:status')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  async getAllRMBEmployeesByStatus(@Query('status') status: string) {
    return new ApiResponse(
      true,
      'The rmb employees retrieved successfully',
      await this.rmbService.getAllRMBEmployeesByStatus(status),
    );
  }
}
