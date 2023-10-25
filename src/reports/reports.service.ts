import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Request } from 'express';
import { CreateReportDTO } from 'src/dtos/create-report.dto';
import { UpdateReportDTO } from 'src/dtos/update-report.dto';
import { EmployeeService } from 'src/employees/employee.service';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { Report } from 'src/entities/report.entity';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';
import { FilesService } from 'src/files/files.service';
import { MinesiteService } from 'src/minesite/minesite.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) public reportRepo: Repository<Report>,
    private readonly utilsService: UtilsService,
    private readonly mineSiteService: MinesiteService,
    private readonly employeeService: EmployeeService,
    private readonly fileService: FilesService,
  ) {}
  async createReport(req: Request, dto: CreateReportDTO, @UploadedFile() file) {
    await this.utilsService.validateFile('pdf', file);
    console.log(await this.fileService.uploadFile(file));

    const report: Report = new Report(
      await this.utilsService.getReportCategory(dto.category),
      dto.indicator,
      dto.date,
      dto.description,
      dto.bleedingLevel,
      dto.condition,
      dto.action,
      dto.nonEmployedVictims,
      await this.fileService.uploadFile(file),
    );
    const mineSite = await this.mineSiteService.getMineSiteById(dto.mineSiteId);
    return await this.utilsService
      .getLoggedInProfile(req, 'company')
      .then(async (result) => {
        report.owner = result;
        report.mineSite = mineSite;
        const promises: any = dto.victimsIds.map(async (id) => {
          return await this.employeeService.getEmployeeById(id);
        });
        report.employedVictims = await Promise.all(promises);
        return await this.reportRepo.save(report);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async updateReport(dto: UpdateReportDTO) {
    const report: Report = await this.getReportById(dto.reportId);
    const mineSite = await this.mineSiteService.getMineSiteById(dto.mineSiteId);
    report.mineSite = mineSite;
    report.category = dto.category;
    report.condition = dto.condition;
    report.indicator = dto.indicator;
    report.action = dto.action;
 
    const promises: any = dto.victimsIds.map(async (id) => {
      return await this.employeeService.getEmployeeById(id);
    });
    report.employedVictims = await Promise.all(promises);
    return await this.reportRepo.save(report);
  }

  async getAllReports() {
    return await this.reportRepo.find({
      where: { visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE] },
      relations: ['victims', 'mineSite', 'owner'],
    });
  }

  async getAllMyReports(req: Request) {
    let owner = await this.utilsService.getLoggedInProfile(req, 'company');
    return await this.reportRepo.find({
      where: {
        owner: owner,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
      relations: ['victims', 'mineSite', 'owner'],
    });
  }

  async deleteAllMyReports(req: Request) {
    const reports = await this.getAllMyReports(req);
    reports.forEach(async (report) => {
      report.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
      await this.reportRepo.save(report);
    });
  }

  async deleteMyReport(id: UUID, req: Request) {
    const owner: MiningCompanyEmployee =
      await this.utilsService.getLoggedInProfile(req, 'company');
    const myReport = await this.reportRepo.findOne({
      where: { id: id },
    });
    if (myReport.owner != owner)
      throw new ForbiddenException('This report is not yours');
    myReport.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
    await this.reportRepo.save(myReport);
  }
  async getReportById(id: UUID) {
    const report: Report = await this.reportRepo.findOne({
      where: { id: id },
      relations: ['victims', 'mineSite', 'owner'],
    });
    if (!report)
      throw new NotFoundException(
        'The report with the provided id is not found',
      );
    return report;
  }
}
