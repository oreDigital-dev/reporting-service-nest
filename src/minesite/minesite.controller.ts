import { Body, Controller, Post } from '@nestjs/common';
import { MinesiteService } from './minesite.service';
import { createMineSiteDTO } from 'src/dtos/create-minesite.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('minesite')
@Controller('minesite')
export class MinesiteController {
    constructor(private mineSiteService: MinesiteService) {}
    @Post()
    createMineSite(@Body() body: createMineSiteDTO){
        return this.mineSiteService.createMineSite(body)
    }
}
