import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { MinesiteService } from './minesite.service';
import { createMineSiteDTO } from 'src/dtos/create-minesite.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { async } from 'rxjs';

@ApiTags('minesites')
@Controller('minesites')
export class MinesiteController {
  constructor(private mineSiteService: MinesiteService) {}
  @Post('create')
  async createMineSite(
    @Body() body: createMineSiteDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const createdMineSite = await this.mineSiteService.createMineSite(
      body,
      req,
      res,
    );
    return new ApiResponse(
      true,
      'MineSite created successfully',
      createdMineSite,
    );
  }
}
