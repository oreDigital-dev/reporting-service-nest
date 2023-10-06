import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDTO } from 'src/dtos/create-employee.dto';
import { UpdateEmployeeDTO } from 'src/dtos/update-employee.dto';
import { EmployeeService } from './employee.service';
import { Request } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { UUID } from 'crypto';
import { Roles } from 'src/decorators/roles.decorator';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDTO } from 'src/dtos/page-options.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('employees')
@ApiTags('company-employees')
export class EmployeeController {
  constructor(
    private empService: EmployeeService,
    private userService: UsersService,
  ) {}

  @Post('/create')
  @Public()
  async createEmployee(@Req() req: Request, @Body() dto: CreateEmployeeDTO) {
    try {
      const employee = await this.empService.createEmployee(req, dto);
      console.log(employee);
      return new ApiResponse(
        true,
        'The employee created successfully',
        employee,
      );
    } catch (error) {
      console.error(error); // Log the error
      throw error; // Rethrow the error to ensure it's properly handled
    }
  }

  @Get('/update')
  async updateEmployee(@Body() dto: UpdateEmployeeDTO): Promise<ApiResponse> {
    try {
      const updatedEmployee = await this.empService.updateEmployee(dto);
      return new ApiResponse(
        true,
        'The employee updated successfully',
        updatedEmployee,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('/one/:email')
  async getEmployeeByEmail(
    @Param('email') email: string,
  ): Promise<ApiResponse> {
    try {
      const employee = await this.empService.getEmployeeByEmail(email);
      return new ApiResponse(
        true,
        'The employee retrieved successfully',
        employee,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('/one/:id')
  async getEmployeeById(@Param('id') id: number): Promise<ApiResponse> {
    try {
      const employee = await this.empService.getEmployeeById(id);
      return new ApiResponse(
        true,
        'The employee retrieved successfully',
        employee,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('/all/by-loggedin-company')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'COMPANY_EMPLOYEE')
  async getEmployeesByLoggedInCompany(
    @Query() pageOptionsDto: PageOptionsDTO,
    @Req() req: Request,
  ) {
    try {
      const employees = await this.empService.getEmployeesByLoggedInCompany(
        req,
        pageOptionsDto,
      );

      return new ApiResponse(
        true,
        'All employees retrieved successfully',
        employees,
      );
      // return this.empService.getEmployeesByLoggedInCompany(req, pageOptionsDto)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Put('/approve-or-reject')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWN')
  async approveOrReject(
    @Query('id') id: number,
    @Query('action') action: string,
  ) {
    return new ApiResponse(
      true,
      'The employee was updated successfully',
      await this.empService.approveAndRejectEmp(id, action),
    );
  }

  @Get('/all')
  @Roles('RMD_ADMIN', 'SYSTEM_ADMIN')
  async getAllEmployees(): Promise<ApiResponse> {
    try {
      const employees = await this.empService.getAllEmployees();
      return new ApiResponse(
        true,
        'All employees retrieved successfully',
        employees,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  @Get('all/by-status')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN')
  async getMiningCompanyEmployeesByStatus(
    @Query('status') status: string,
    @Req() req: Request,
  ) {
    return new ApiResponse(
      true,
      'Mining company retrieved successfully',
      await this.empService.getMiningCompanyEmployeesByStatus(status, req),
    );
  }

  // @Put('approve-or-reject')
  // @Roles('COMPANY_EMPLOYEE', 'COMPANY_OWNER', 'COMPANY_ADMIN')
  // async approveorRejectMiningCompanyEmployees(
  //   @Body() dto: ApproveOrRejectEmployeeDTO,
  // ) {
  //   return new ApiResponse(
  //     true,
  //     'Empoyeee updated successfully',
  //     await this.empService.approveorRejectMiningCompanyEmployees(
  //       dto.id,
  //       dto.action,
  //     ),
  //   );
  // }

  @Delete('/all')
  @Roles('RMB_ADMI')
  async deleteAllEmployees(): Promise<ApiResponse> {
    try {
      await this.empService.deleteAllEmployees();
      return new ApiResponse(true, 'All employees deleted successfully', null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Delete('/:id')
  @Roles('COMPANY_ADMIN', 'COMPANY_EMPLOYEE')
  async deleteEmployeeById(@Param('id') id: UUID): Promise<ApiResponse> {
    try {
      await this.empService.deleteEmployeeById(id);
      return new ApiResponse(true, 'The employee deleted successfully', null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
