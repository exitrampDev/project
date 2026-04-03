// invite.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Invite, InviteDocument } from './schema/invite.schema';
import { CreateInviteDto } from './dto/create-invite.dto';
import {
  UpdateInviteStatusDto,
  InviteStatus,
} from './dto/update-invite-status.dto';
import { QueryInviteDto } from './dto/query-invite.dto';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
  ) {}

  //  Create Invite
  async create(dto: CreateInviteDto) {
    if (dto.invitedUserId === dto.invitedByUserId) {
      throw new BadRequestException('User cannot invite themselves');
    }

    try {
      const invite = await this.inviteModel.create(dto);
      return invite;
    } catch (error) {
      if ((error as any)?.code === 11000) {
        throw new ConflictException('Invite already exists');
      }
      throw error;
    }
  }

  //  Get All Invites (with filters)
  async findAll(query: QueryInviteDto) {
    const filter: any = {};

    if (query.invitedUserId) {
      filter.invitedUserId = query.invitedUserId;
    }

    if (query.invitedByUserId) {
      filter.invitedByUserId = query.invitedByUserId;
    }

    if (query.businessId) {
      filter.businessId = query.businessId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    return this.inviteModel
      .find(filter)
      .populate('invitedUserId', 'name email')
      .populate('invitedByUserId', 'name email')
      .populate('businessId', 'name')
      .sort({ createdAt: -1 });
  }

  //  Get Single Invite
  async findOne(id: string) {
    const invite = await this.inviteModel
      .findById(id)
      .populate('invitedUserId', 'name email')
      .populate('invitedByUserId', 'name email')
      .populate('businessId', 'name');

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return invite;
  }

  //  Update Invite Status (Accept / Reject)
  async updateStatus(id: string, dto: UpdateInviteStatusDto) {
    const invite = await this.inviteModel.findById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(
        'Only pending invites can be updated',
      );
    }

    invite.status = dto.status;
    await invite.save();

    return invite;
  }

  //  Delete Invite
  async remove(id: string) {
    const invite = await this.inviteModel.findByIdAndDelete(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return { message: 'Invite deleted successfully' };
  }

  //  Get Pending Invites for a User
  async getPendingForUser(userId: string) {
    return this.inviteModel
      .find({
        invitedUserId: userId,
        status: InviteStatus.PENDING,
      })
      .populate('invitedByUserId', 'name email')
      .populate('businessId', 'name')
      .sort({ createdAt: -1 });
  }
}