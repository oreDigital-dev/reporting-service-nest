import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Incident } from 'src/entities/incident.entity';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) public incidentRepo: Repository<Incident>,
  ) {}

  // async saveIncident(dto : CreateIncidentDTO ){
  //     if(!this.utilService.idValidator(dto.mineSite)) throw new BadRequestException("Please provide a valid original mine site id")
  //     const availableMineSite  = await
  // }
}
