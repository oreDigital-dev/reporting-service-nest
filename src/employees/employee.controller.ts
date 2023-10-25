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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDTO } from 'src/dtos/create-employee.dto';
import { EmployeeService } from './employee.service';
import { Request } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { UUID } from 'crypto';
import { Roles } from 'src/decorators/roles.decorator';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDTO } from 'src/dtos/page-options.dto';
import { Public } from 'src/decorators/public.decorator';
import { CreatESelfEmployeeDTO } from 'src/dtos/create_self-employee.dto';

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

  @Post('create/self-account')
  @Public()
  async createSelfAccount(@Body() dto: CreatESelfEmployeeDTO) {
    return new ApiResponse(
      true,
      'We have sent a verification code to your mobile phone and gmail, please check it out and verifiy your account',
      await this.empService.createSelfAccount(dto),
    );
  }

  @Put('/update:id')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
  async updateEmployee(
    @Param('id') id: UUID,
    @Body() dto: CreateEmployeeDTO,
  ): Promise<ApiResponse> {
    try {
      const updatedEmployee = await this.empService.updateMiningCompanyEmployee(
        id,
        dto,
      );
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
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
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
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
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
  @ApiQuery({
    name: 'action',
    type: String,
    required: true,
    example: 'approve',
  })
  @ApiQuery({ name: 'id', required: true })
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
  @Get('all/by-employee-status')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN')
  @ApiQuery({
    name: 'status',
    required: true,
    type: String,
    example: 'pending',
  })
  async getMiningCompanyEmployeesByStatus(
    @Query('status') status: string,
    @Req() req: Request,
  ) {
    return new ApiResponse(
      true,
      'Mining company retrieved successfully',
      await this.empService.getMiningCompanyEmployeesByEmployeeStatus(
        status,
        req,
      ),
    );
  }

  @Delete('/all')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
  async deleteAllEmployees(@Req() req: Request): Promise<ApiResponse> {
    try {
      await this.empService.deleteAllEmployees(req);
      return new ApiResponse(true, 'All employees deleted successfully', null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Delete('/:id')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
  @ApiQuery({
    name: 'id',
    required: true,
  })
  async deleteEmployeeById(
    @Param('id') id: UUID,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    try {
      await this.empService.deleteEmployeeById(id, req);
      return new ApiResponse(true, 'The employee deleted successfully', null);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
