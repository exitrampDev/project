import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteService } from './invite.service';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';
import { QueryInviteDto } from './dto/query-invite.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UsersService } from 'src/users/users.service';
import { v4 as uuid } from 'uuid';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { UpdateInviteAccessDto } from './dto/update-invitation-access.dto';
import { rejectInviteDto } from './dto/reject-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';

@Controller('invite')
export class InviteController {

  constructor(private readonly inviteService: InviteService,
        private readonly userService: UsersService
     ) { 

     }

@UseGuards(JwtAuthGuard)
@Post()
  async create(@Body() dto: CreateInviteDto, @User() user: any) {
     if (user?.userId) {
      dto.invitedByUserId = user.userId;
    }
   let invitedUser = await this.userService.findByEmail(dto.invitedEmail);
   if (invitedUser) {
     dto.invitedUserId = String(invitedUser._id);
   }
    dto.invitationHash = uuid();
  return this.inviteService.create(dto);
}

@UseGuards(JwtAuthGuard)
@Patch(':id')
  async update( @Param('id') id: string, @Body() dto: UpdateInviteDto, @User() user: any) {
     if (user?.userId) {
      dto.invitedByUserId = user.userId;
    }
  
  return this.inviteService.update(id, dto, user);
}

@UseGuards(JwtAuthGuard)
@Get()
findAll(@Query() query: QueryInviteDto, @User() user: any) {
  if (user?.userId) {
      query.invitedByUserId = user.userId;
    }
  return this.inviteService.findAll(query);
}

@UseGuards(JwtAuthGuard)
@Get('received')
findAllReceived(@Query() query: QueryInviteDto, @User() user: any) {
  if (user?.userId) {
      query.invitedUserId = user.userId;
    }
  return this.inviteService.findAll(query);
}

@UseGuards(JwtAuthGuard)
@Patch(':id/status')
updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateInviteStatusDto,
) {
  return this.inviteService.updateStatus(id, dto);
}


@UseGuards(JwtAuthGuard)
@Post('accept')
AcceptInvite(@Body() body: AcceptInviteDto, @User() user: any) {
 
  return this.inviteService.acceptInvite(body, user);
}
  
@UseGuards(JwtAuthGuard)
@Post('reject')
RejectInvite(@Body() body: rejectInviteDto, @User() user: any) { 
  return this.inviteService.rejectInvite(body, user);
}

// ---------------------------GRANT and REVOKE ACCESS---------------------------
@UseGuards(JwtAuthGuard)
@Post('access')
UpdateInviteAccess(@Body() body: UpdateInviteAccessDto, @User() user: any) {
 
  return this.inviteService.updateInviteAccess(body, user);
}


}
