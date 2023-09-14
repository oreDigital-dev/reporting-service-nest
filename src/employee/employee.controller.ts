import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDTO } from 'src/dtos/create-employee.dto';
import { UpdateEmployeeDTO } from 'src/dtos/update-employee.dto';
import { EmployeeService } from './employee.service';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { UUID } from 'crypto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { MailingService } from 'src/mailing/mailing.service';

@Controller('employees')
@ApiTags('company-employees')
@Roles('COMPANY_OWNER')
export class EmployeeController {
  constructor(
    private empService: EmployeeService,
    private mailService: MailingService,
  ) {}

  @Post('/create')
  async createEmployee(@Body() dto: CreateEmployeeDTO) {
    try {
      const employee = await this.empService.createEmployee(dto);
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
  async getEmployeeById(@Param('id') id: UUID): Promise<ApiResponse> {
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
  async getEmployeesByLoggedInCompany(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResponse> {
    try {
      const employees = await this.empService.getEmployeesByLoggedInCompany(
        req,
        res,
      );
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

  @Get('/all')
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

  @Delete('/all')
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
