import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query
} from '@nestjs/common';

import { TicketService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueryBusinessDto } from 'src/business-listing/dto/query-business.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guards';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTicket(
    @User() user: any,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(
      user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async myTickets(@Query() query: QueryTicketDto, @User() user: any ) {
    return this.ticketService.myTickets(query, user.userId);
  }

  @UseGuards(JwtAuthGuard) 
  @Patch(':id/status')
  async changeStatus(
    @Param('id') ticketId: string,
    @User() user: any,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketService.changeStatus(
      ticketId,
      user.userId,
      dto.status,
    );
  }

//   ==============================================Admin Endpoints==============================================

 @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('admin')
  @Get()
  async myAllTickets(@Query() query: QueryTicketDto, @User() user: any ) {
    return this.ticketService.allTickets(query, user.userId);
  }


}