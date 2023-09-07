import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exception } from 'handlebars';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { Incident } from 'src/entitties/incident.entity';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(Incident) public incidentRepo:  Repository<Incident>,
        private utilService : UtilsService
    ){}

    // async saveIncident(dto : CreateIncidentDTO ){
    //     if(!this.utilService.idValidator(dto.mineSite)) throw new BadRequestException("Please provide a valid original mine site id")
    //     const availableMineSite  = await 
    // }


}
