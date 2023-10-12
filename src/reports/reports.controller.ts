import { Controller, Post, Put, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('reports')
@ApiTags('reports')
export class ReportsController {
  @Post('create')
  async createReport(@Req() req: Request) {}

  @Put('update')
  async updateReport(@Req() req: Request) {}
}
