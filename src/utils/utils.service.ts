import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UploadedFile,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Exception } from 'handlebars/runtime';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { MainUser } from 'src/entities/MainUser.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { EGender } from 'src/enums/EGender.enum';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { EmployeeService } from 'src/employees/employee.service';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UsersService } from 'src/users/users.service';
import * as ExcelJs from 'exceljs';
import { Organization } from 'src/entities/organization.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { RescueTeam } from 'src/entities/rescue-team.entity';
import { EEmployeeStatus } from 'src/enums/EEmployeeStatus.enum';
import { file } from '@babel/types';
import { EFileType } from 'src/enums/EFileType.enum';

@Injectable()
export class UtilsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private miningCompanyService: EmployeeService,
    @Inject(forwardRef(() => RmbService))
    private rmbEmployeeService: RmbService,
    @Inject(RescueTeamsService)
    private readonly rescueTeamService: RescueTeamsService,
  ) {}

  async getTokens(
    user: MainUser,
    entity: string,
  ): Promise<{ accessToken: String; refreshToken: String }> {
    let type: string;

    switch (entity.toUpperCase()) {
      case 'RMB':
        type = EAccountType[EAccountType.RMB];
        break;
      case 'COMPANY':
        type = EAccountType[EAccountType.COMPANY];
        break;
      case 'RESCUE_TEAM':
        type = EAccountType[EAccountType.RESCUE_TEAM];
        break;
      default:
        throw new BadRequestException(
          'The provided entity type is not defined',
        );
    }

    const accessToken: String = await this.jwtService.signAsync(
      {
        type: type,
        roles: user.roles,
        id: user.id,
        national_id: user.national_id,
      },
      {
        expiresIn: '10h',
        secret: this.configService.get('SECRET_KEY'),
      },
    );
    const refreshToken: String = await this.jwtService.signAsync(
      {
        type: type,
        roles: user.roles,
        id: user.id,
        national_id: user.national_id,
      },
      {
        expiresIn: '1d',
        secret: this.configService.get('SECRET_KEY'),
      },
    );

    return {
      accessToken: accessToken.toString(),
      refreshToken: refreshToken.toString(),
    };
  }

  validateStatus(status: string) {
    switch (status.toUpperCase()) {
      case EEmployeeStatus[EEmployeeStatus.APPROVED]:
        return EEmployeeStatus[EEmployeeStatus.APPROVED];
      case EEmployeeStatus[EEmployeeStatus.REJECTED]:
        return EEmployeeStatus[EEmployeeStatus.REJECTED];
      case EEmployeeStatus[EEmployeeStatus.PENDING]:
        return EEmployeeStatus[EEmployeeStatus.PENDING];
      default:
        throw new BadRequestException('The provided status is invalid');
    }
  }

  async hashString(input: string) {
    try {
      const hashed = await bcrypt.hash(input, 10);
      return hashed;
    } catch (error) {
      console.error('Error occurred while hashing:', error.message);
      throw error;
    }
  }

  generateRandomFourDigitNumber(): number {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  idValidator(id: String): boolean {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id.toString());
  }

  getGender = (gender: string): string => {
    switch (gender.toUpperCase()) {
      case EGender[EGender.FEMALE]:
        return EGender[EGender.FEMALE];
      case EGender[EGender.MALE]:
        return EGender[EGender.MALE];
      case EGender[EGender.OTHER]:
        return EGender[EGender.OTHER];
      default:
        throw new BadRequestException('The provided gender is invalid');
    }
  };

  getEmployeeType = (type: string) => {
    switch (type.toUpperCase()) {
      case EEmployeeType[EEmployeeType.ADMIN]:
        return EEmployeeType[EEmployeeType.ADMIN];
      case EEmployeeType[EEmployeeType.EMPLOYEE]:
        return EEmployeeType[EEmployeeType.EMPLOYEE];
      default:
        throw new BadRequestException('The provided employee type is invalid');
    }
  };

  getRescueTeamCategory = (category: string) => {
    switch (category.toUpperCase()) {
      case ERescueTeamCategory[ERescueTeamCategory.IMMEASUREY]:
        return ERescueTeamCategory[ERescueTeamCategory.IMMEASUREY];
      case ERescueTeamCategory[ERescueTeamCategory.POLICE]:
        return ERescueTeamCategory[ERescueTeamCategory.POLICE];
      case ERescueTeamCategory[ERescueTeamCategory.RED_CROSS]:
        return ERescueTeamCategory[ERescueTeamCategory.RED_CROSS];
      default:
        throw new BadRequestException(
          'The rescue team category provided is invalid',
        );
    }
  };

  async getLoggedInProfile(req: Request, type: string) {
    const authorization = req.headers.authorization;
    let user: any;
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (!authorization.toString().startsWith('Bearer '))
        throw new UnauthorizedException('The provided token is invalid');
      const { tokenVerified, error } = this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_KEY'),
      });
      if (error)
        throw new BadRequestException({
          sucess: false,
          message: error.message,
        });
      const details: any = await this.jwtService.decode(token);
      switch (type.toUpperCase()) {
        case EAccountType[EAccountType.COMPANY]:
          user = await this.miningCompanyService.getEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RMB]:
          user = await this.rmbEmployeeService.getRMBEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RESCUE_TEAM]:
          user = await this.rescueTeamService.rescueTeamEmployeeRepo.findOne({
            where: { id: details.id },
            relations: ['rescueTeam'],
          });
          break;
        default:
          throw new BadRequestException(
            'The provided user type to decode is invalid',
          );
      }
      return user;
    } else {
      throw new Exception('Please you are not authorized to access resource');
    }
  }

  async downloadEmployeesExcel(employees: any[]) {
    if (employees.length == 0)
      throw new ForbiddenException('Employee list is empty');
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Mining_company_emaployees');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'First Name', key: 'FirstName', width: 36 },
      { header: 'Last Name', key: 'LastName', width: 36 },
      { header: 'Email', key: 'Email', width: 20 },
      { header: 'Phone Number', key: 'PhoneNumber', width: 36 },
      { header: 'Company Name', key: 'CompanyName', width: 36 },
      { header: 'District', key: 'District', width: 36 },
      { header: 'Sector', key: 'Sector', width: 36 },
      { header: 'Cell', key: 'Cell', width: 36 },
      { header: 'Village', key: 'Village', width: 36 },
      { header: 'Status', key: 'Status', width: 36 },
    ];

    let i = 1;
    employees.forEach((employee) => {
      worksheet.addRow({
        id: i,
        FirstName: employee.firstName,
        LastName: employee.lastName,
        companyName:
          employee.company.name == null ? ' ' : employee.company.name,
        District: employee.address.district,
        Sector: employee.address.sector,
        Cell: employee.address.cell,
        Village: employee.address.village,
        Status: employee.employeeStatus,
      });

      i++;
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA500' },
    };

    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async downloadCompaniesExcel(companies: MiningCompany[]) {
    if (companies.length == 0)
      throw new ForbiddenException('The companies list is empty');
    const workbook = new ExcelJs.Workbook();
    const workSheet = workbook.addWorksheet('companies');

    workSheet.columns = [
      { header: 'Id', key: 'id', width: 10 },
      { header: 'Company Name', key: 'name', width: 36 },
      { header: 'District', key: 'District', width: 36 },
      { header: 'Sector', key: 'Sector', width: 36 },
      { header: 'Cell', key: 'Cell', width: 36 },
      { header: 'Village', key: 'Viallge', width: 36 },
      { header: 'Status', key: 'Status', width: 10 },
    ];

    let i = 1;
    companies.forEach((company) => {
      workSheet.addRow({
        id: i,
        name: company.name,
        district: company.address.district,
        sector: company.address.sector,
        cell: company.address.cell,
        village: company.address.village,
      });
      i++;
    });

    workSheet.getRow(1).font = { bold: true };
    workSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA500' },
    };

    workSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async downloadRescueTeamsExcel(rescueTeams: RescueTeam[]) {
    if (rescueTeams.length == 0)
      throw new ForbiddenException('The rescue teams list is empty');

    const workbook = new ExcelJs.Workbook();
    const workSheet = workbook.addWorksheet('Rescue teams');

    workSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'RescueTeam Name', key: 'name', width: 36 },
      { header: 'District', key: 'District', width: 36 },
      { header: 'Sector', key: 'Sector', width: 36 },
      { header: 'Cell', key: 'Cell', width: 36 },
      { header: 'Village', key: 'Viallge', width: 36 },
      { header: 'Status', key: 'Status', width: 10 },
    ];

    let i = 0;
    rescueTeams.forEach((rescueTeam) => {
      workSheet.addRow({
        id: i,
        name: rescueTeam.name,
        District: rescueTeam.address.district,
        Sector: rescueTeam.address.sector,
        Cell: rescueTeam.address.cell,
        Village: rescueTeam.address.village,
        Status: rescueTeam.status,
      });
      i++;
    });
    workSheet.getRow(1).font = { bold: true };
    workSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA500' },
    };

    workSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  validateFile(type: string, @UploadedFile() file) {
    if (file.originalname.split('.').length > 2)
      throw new BadRequestException(
        `Your file name should not include '.' symbol`,
      );
    let extenstion = file.originalname.split('.')[1];
    switch (type.toUpperCase()) {
      case EFileType[EFileType.XLSX]:
        if (extenstion.toUpperCase() != EFileType[EFileType.XLSX])
          throw new BadRequestException(
            'The provided file is not an excel file',
          );
        break;
      case EFileType[EFileType.DOCX]:
        break;
      case EFileType[EFileType.PDF]:
        break;
      default:
        throw new BadRequestException('The provided file type is invalid');
    }
  }
}
