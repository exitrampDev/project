import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Ticket,
  TicketDocument,
  TicketStatus,
} from './schema/tickets.schema';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { TicketMessage, TicketMessageDocument } from './schema/tocket-message.schema';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)  private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(TicketMessage.name)  private readonly ticketMessageModel: Model<TicketMessageDocument>,
  ) {}

  async createTicket(
    userId: string,
    dto: CreateTicketDto,
  ) {
    const ticket = await this.ticketModel.create({
      ...dto,
      createdBy: new Types.ObjectId(userId),
    });

    await this.ticketMessageModel.create({
    ticketId: ticket._id,
    senderId: userId,
    senderType: 'user',
    message: dto.ticketDescription,
    });

    return ticket;
  }

    async createUserTicketMessage(
    userId: string,
    dto: CreateTicketMessageDto,
    ticketId: string,
    senderType = 'user',
  ) {
    const ticket = await this.ticketModel.countDocuments({
     _id: new Types.ObjectId(ticketId),    
    }).exec();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

   const data = await this.ticketMessageModel.create({
    ticketId: new Types.ObjectId(ticketId),
    senderId: userId,
    senderType: senderType,
    message: dto.message,
    });

    return data;
  }

  async getMessages(ticketId: string) {
  return this.ticketMessageModel
    .find({
     ticketId: new Types.ObjectId(ticketId),
      deletedAt: { $eq: null },
    })
    .populate({ path: 'senderId', select: 'first_name last_name email' })
    .sort({ createdAt: 1 });
}

  async myTickets(query: QueryTicketDto, userId: string) {

     const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { deletedAt: null,  createdBy: new Types.ObjectId(userId)};
    const andConditions: any[] = [];

    const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    /**
     * Global text search (OR across multiple fields)
     */
    if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');

    andConditions.push({
        $or: [
        { ticketTitle: regex },
        { ticketDescription: regex },
        { status: regex }
        ],
    });
    }

    if (andConditions.length > 0) {
        filter.$and = andConditions;
    }

    const data = await this.ticketModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await this.ticketModel.countDocuments(filter);

    return {
      total,
      page,
      limit,
      data,
    };
  }

   async allTickets(query: QueryTicketDto, userId: string) {

     const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { deletedAt: null};
    const andConditions: any[] = [];

    const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    /**
     * Global text search (OR across multiple fields)
     */
    if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');

    andConditions.push({
        $or: [
        { ticketTitle: regex },
        { ticketDescription: regex },
        { status: regex }
        ],
    });
    }

    if (andConditions.length > 0) {
        filter.$and = andConditions;
    }

    const data = await this.ticketModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await this.ticketModel.countDocuments(filter);

    return {
      total,
      page,
      limit,
      data,
    };
  }
  async changeStatus(
    ticketId: string,
    userId: string,
    status: TicketStatus,
  ) {
    const ticket = await this.ticketModel.findOne({
      _id: ticketId,
      deletedAt: null,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.createdBy.toString() !== userId) {
      throw new ForbiddenException(
        'You can only update your own tickets',
      );
    }

    ticket.status = status;

    await ticket.save();

    return ticket;
  }
}