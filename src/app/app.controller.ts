import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { Public } from 'src/decorators/public.decorator';
import { EmployeeService } from 'src/employees/employee.service';
import { MainUser } from 'src/entities/MainUser.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { RescueTeam } from 'src/entities/rescue-team.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { ApiResponse } from 'src/payload/apiResponse';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UtilsService } from 'src/utils/utils.service';
import { Between } from 'typeorm';
import * as ExcelJs from 'exceljs';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddressService } from 'src/address/address.service';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { Address } from 'src/entities/address.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('app')
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly employeesService: EmployeeService,
    private readonly rmbService: RmbService,
    private readonly rescueTeamService: RescueTeamsService,
    private readonly utilsService: UtilsService,
    private readonly companyService: CompanyService,
    private readonly addressService: AddressService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Public()
  @Get('/get-profile')
  async getProfile(@Req() req: Request, @Query('type') type: string) {
    return new ApiResponse(
      true,
      'The profile retrieved successfully',
      await this.authService.getProfile(req, type),
    );
  }

  @Get('reporting/employees/filter-by-status-date')
  @Roles(
    'SYSTEM_ADMIN',
    'RMB_ADMIN',
    'COMPANY_ADMIN',
    'COMPANY_OWNER',
    'RESCUE_TEAM_ADMIN',
    'RESCUE_TEAM_OWNER',
  )
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  @ApiQuery({
    name: 'org',
    required: true,
    description: 'Organization in which an employee is located in',
    type: String,
    example: 'rmb',
  })
  async exportEmployeesFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Query('org') org: String,
    @Res() res: Response,
  ) {
    let employees: MainUser[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    switch (org.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        employees = await this.employeesService.employeeRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['company', 'address'],
        });
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        employees = await this.rescueTeamService.rescueTeamEmployeeRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['rescueTeam', 'address'],
        });
        break;
      case EAccountType[EAccountType.RMB]:
        employees = await this.rmbService.rmbRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['address'],
        });
        break;
      default:
        throw new BadRequestException('The provided organization is invalid');
    }

    const buffer = await this.utilsService.downloadEmployeesExcel(employees);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Employees.xlsx`,
    );
    res.send(buffer);
  }

  @Get('reporting/companies/filter-by-status-date')
  @Roles('SYSTEM_ADMIN', 'RMB_ADMIN')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  async exportCompaniesFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    let companies: MiningCompany[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    companies = await this.companyService.companyRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: validatedStatus,
      },
      relations: ['address'],
    });

    const buffer = await this.utilsService.downloadCompaniesExcel(companies);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Companies.xlsx`,
    );
    res.send(buffer);
  }

  @Get('reporting/rescue_teams/filter-by-status-date')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  async exportRescueTeamsFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    let rescueTeams: RescueTeam[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    rescueTeams = await this.rescueTeamService.rescueTeamRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: validatedStatus,
      },
      relations: ['address'],
    });

    const buffer = await this.utilsService.downloadRescueTeamsExcel(
      rescueTeams,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Rescue_teams.xlsx`,
    );
    res.send(buffer);
  }

  @Post('importing/employees')
  @Roles('COMPANY_ADMIN', 'COMPANY_EMPLOYEE')
  @UseInterceptors(FileInterceptor('file'))
  @ApiQuery({ name: 'org', type: String, required: true, example: 'company' })
  async importEmployees(
    @UploadedFile() file,
    @Query('org') type: string,
    @Req() req: Request,
  ) {
    const companyOwner = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    this.utilsService.validateFile('XLSX', file);
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.load(file.buffer);

    const workSheet = workbook.getWorksheet(1);
    await Promise.all(
      workSheet.getRows(1, workSheet.rowCount).map(async (row, number) => {
        if (number !== 1) {
          let values = [];
          row.eachCell((cell, cellNumber) => {
            if (cellNumber !== 1) {
              values.push(cell.value);
            }
          });

          console.log(values[4]);
          const employee = new MiningCompanyEmployee(
            values[0],
            values[1],
            values[2],
            EGender[this.utilsService.getGender(values[4])],
            '',
            `+250${values[3]}`,
            '@oreDigital123',
            EAccountStatus.WAITING_EMAIL_VERIFICATION,
            this.utilsService.generateRandomFourDigitNumber(),
          );

          const address = new Address(
            values[5].toUpperCase(),
            values[6].toUpperCase(),
            'Mukamira',
            'Jaba',
            'Jaba',
          );

          const createdAddress = await this.addressService.addressRepo.save(
            address,
          );
          employee.address = createdAddress;
          employee.company = companyOwner.company;
          await this.employeesService.createExcelEmp(employee);
        }
      }),
    );
  }
}
