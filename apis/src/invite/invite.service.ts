// invite.service.ts

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Invite, InviteDocument } from './schema/invite.schema';
import { CreateInviteDto } from './dto/create-invite.dto';
import {
  UpdateInviteStatusDto,
  InviteStatus,
} from './dto/update-invite-status.dto';
import { QueryInviteDto } from './dto/query-invite.dto';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { InviteAccess, UpdateInviteAccessDto } from './dto/update-invitation-access.dto';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  //  Create Invite
  async create(dto: CreateInviteDto) {
    if (dto.invitedUserId === dto.invitedByUserId) {
      throw new BadRequestException('User cannot invite themselves');
    }

    try {

      let existingInvite = await this.inviteModel.find({
        invitedEmail: dto.invitedEmail,
        businessId: dto.businessId,
      });
      if (existingInvite.length > 0) {
        throw new ConflictException('An active invite already exists for this email and business');
      }


      const invite = await this.inviteModel.create(dto);
      const inviteLink = `${process.env.APP_URL}/accept-invite?hash=${invite.invitationHash}`;

      await this.mailService.sendMail(
          dto.invitedEmail,
          'Exit Ramp Invitation',
          'invitationForListing',
          {
            receiverName: dto.name ? dto.name : 'User',
            message: `Your are invited to join the business Listing on Exit Ramp. Please log in to your account to accept or reject the invitation.`,
            link: inviteLink
          }
        );




      return invite;
    } catch (error) {
      if ((error as any)?.code === 11000) {
        throw new ConflictException('Invite already exists');
      }
      throw error;
    }
  }

  // update invitation
  async update(id: string, dto: Partial<CreateInviteDto>, user: any) {
    const invite = await this.inviteModel.findById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    // Authorization check (compare with DB value, not DTO)
    if (user?.userId !== invite.invitedByUserId) {
      throw new ForbiddenException('You are not allowed to update this invite');
    }
    if(dto.invitedEmail && dto.invitedEmail !== invite.invitedEmail){
      throw new BadRequestException('Email cannot be updated');
    }

    Object.assign(invite, dto);
    return await invite.save();
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
      .populate('businessId', 'listingTitle')
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


   async acceptInvite(body: any, user: any) {
    console.log('Accepting invite with body:', body, 'for user:', user);
      const userDoc: UserDocument | null = await this.userService.findByEmail(user.email);
      if (!userDoc) {
        throw new NotFoundException('User not found');
      }


      const invite: InviteDocument | null  = await this.inviteModel.findOne({
      invitationHash: body.invitationHash,
      invitedEmail: user.email,
      
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(
        'Already responded to this invite',
      );
    }

    invite.status = InviteStatus.ACCEPTED;
    invite.invitedUserId = userDoc.id.toString();
    await invite.save();

    return invite;
  }

  

   async rejectInvite(body: any, user: any) {
    console.log('Rejecting invite with body:', body, 'for user:', user);
      const userDoc: UserDocument | null = await this.userService.findByEmail(user.email);
      if (!userDoc) {
        throw new NotFoundException('User not found');
      }


      const invite: InviteDocument | null  = await this.inviteModel.findOne({
      invitationHash: body.invitationHash,
      invitedEmail: user.email,
      
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status == InviteStatus.REJECTED) {
      throw new BadRequestException(
        'Already rejected this invite',
      );
    }

    invite.status = InviteStatus.REJECTED;
   
    await invite.save();

    return invite;
  }


  async updateInviteAccess(body: UpdateInviteAccessDto, user: any) {
    console.log('Updating invite access with body:', body, 'for user:', user);
    const invite: InviteDocument | null  = await this.inviteModel.findOne({
      _id: body.id,
      invitedByUserId: user.userId,
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

  
    invite.access = body.access;
    await invite.save();

    return invite;
  }

  async canUpdateListing(userId, businessId: string) {
    const invite = await this.inviteModel.findOne({
      businessId,
      invitedUserId: userId,
      access: InviteAccess.GRANTED,
      status: InviteStatus.ACCEPTED,
    });

   return invite?.accuisitionType?.viewEditBusinessInfo == 'yes' ? true : false;

    // return !!invite;
  }

}