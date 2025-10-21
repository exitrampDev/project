import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { FlagService } from './flag.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueryFlagDto } from './dto/query-flag.dto';

@Controller('flag')
export class FlagController {
  constructor(private readonly flagService: FlagService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createFlag(@Body() createFlagDto: CreateFlagDto, @Req() req) {
    const userId = req.user.userId || req.user.id;
    const userName = req.user.name || req.user.username;

    const data = {
      ...createFlagDto,
      userId,
      userName,
    };

    return this.flagService.create(data);
  }

  // GET all flags with filters, pagination, sorting
  @UseGuards(JwtAuthGuard) 
  @Get()
  async getFlags(@Query() query: QueryFlagDto) {
    return this.flagService.findAll(query);
  }
}
