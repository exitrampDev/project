import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { DueDiligenceService } from './due-diligence.service';
import { CreateDueDiligenceDto } from './dto/create-due-diligence.dto';
import { UpdateDueDiligenceDto } from './dto/update-due-diligence.dto';

@Controller('due-diligence')
export class DueDiligenceController {
  constructor(private readonly dueDiligenceService: DueDiligenceService) {}

  @Post()
  async create(@Body() dto: CreateDueDiligenceDto) {
    return this.dueDiligenceService.create(dto);
  }

  @Get()
  async findAll() {
    return this.dueDiligenceService.findAll();
  }

  // 👇 Changed from businessId → ndaId
  @Get('nda/:ndaId')
  async findByNda(@Param('ndaId') ndaId: string) {
    const records = await this.dueDiligenceService.findByNda(ndaId);
    if (!records || records.length === 0) {
      throw new NotFoundException(`No due diligence records found for NDA ${ndaId}`);
    }
    return records;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDueDiligenceDto) {
    return this.dueDiligenceService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.dueDiligenceService.delete(id);
  }
}
