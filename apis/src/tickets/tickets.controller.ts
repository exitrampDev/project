import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  ForbiddenException
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
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
  ) {}

  //   ==============================================Admin Endpoints==============================================

//  @UseGuards(JwtAuthGuard, RolesGuard)
//  @Roles('admin')
//   @Get()
//   async myAllTickets(@Query() query: QueryTicketDto, @User() user: any ) {
//     return this.ticketService.allTickets(query, user.userId);
//   }
// ====================================================Admin Endpoints Ends===========================================

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

 @UseGuards(JwtAuthGuard)
  @Post("user/:ticketId/reply")
  async createUserTicketMessage(
    @User() user: any,
    @Body() dto: CreateTicketMessageDto,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ticketService.createUserTicketMessage(
      user.userId,
      dto,
      ticketId,
    );
  }

   @UseGuards(JwtAuthGuard)
  @Post("admin/:ticketId/reply")
  async createTicketMessageByAdmin(
    @User() user: any,
    @Body() dto: CreateTicketMessageDto,
    @Param('ticketId') ticketId: string,
  ) {
    if(!user.roles || !user.roles.includes('admin')) {
      throw new ForbiddenException('Only admins can reply to tickets using this endpoint');
    }

    return this.ticketService.createUserTicketMessage(
      user.userId,
      dto,
      ticketId,
      'admin'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':ticketId/messages')
  async getMessages(@Param('ticketId') ticketId: string) {
    return this.ticketService.getMessages(ticketId);
  }



}