import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Request } from 'express';
import { async } from 'rxjs';
import { CompanyService } from 'src/company/company.service';
import { CreateConcessionDTO } from 'src/dtos/create-concession.dto';
import { Concession } from 'src/entities/concession.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class ConcessionsService {
  constructor(
    @InjectRepository(Concession) public concessionRepo: Repository<Concession>,
    private utilsService: UtilsService,
    private companyService: CompanyService,
  ) {}
  async create(dto: CreateConcessionDTO, req: Request) {
    await this.getByName(dto.name);
    const concession = new Concession(dto.name);
    const owner = await this.utilsService.getLoggedInProfile(req, 'company');
    concession.company = owner.company;
    return await this.concessionRepo.save(concession);
  }

  async update(id: UUID, dto: CreateConcessionDTO) {
    const concessionToUpdate = await this.getById(id);
    concessionToUpdate.name = dto.name;
    return await this.concessionRepo.save(concessionToUpdate);
  }
  async getAll() {
    return await this.concessionRepo.find({
      where: { visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE] },
    });
  }

  async getById(id: UUID) {
    const availableConcession = await this.concessionRepo.findOne({
      where: {
        id: id,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
    });
    if (!availableConcession)
      throw new NotFoundException(
        'The concession with the provided id is not found',
      );
    return availableConcession;
  }
  async getByName(name: string) {
    const availalbleConcession = await this.concessionRepo.findOne({
      where: {
        name: name,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
    });

    if (availalbleConcession)
      throw new BadRequestException(
        "The concession with that name is already registered, you can't create duplicates",
      );
  }

  async getMine(req: Request) {
    const owner = await this.utilsService.getLoggedInProfile(req, 'company');
    return await this.concessionRepo.find({
      where: {
        company: owner.company,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
    });
  }
  async getAllByCompany(id: UUID) {
    const company: any = await this.companyService.getCompanyById(id);
    return await this.concessionRepo.find({
      where: {
        company: company,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
    });
  }
  async deleteById(id: UUID) {
    const concession = await this.concessionRepo.findOne({ where: { id: id } });
    concession.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
    await this.concessionRepo.save(concession);
  }
  async deleteAllMine(req: Request) {
    const owner = await this.utilsService.getLoggedInProfile(req, 'company');
    const concestions = await this.concessionRepo.find({
      where: {
        company: owner.company,
        visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
      },
    });
    concestions.forEach(async (concession) => {
      concession.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
      await this.concessionRepo.save(concession);
    });
  }
}
