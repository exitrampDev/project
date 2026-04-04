import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { InviteService } from './invite.service';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';
import { QueryInviteDto } from './dto/query-invite.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('invite')
export class InviteController {
     constructor(private readonly inviteService: InviteService,
        private readonly userService: UsersService
     ) {}

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
  return this.inviteService.create(dto);
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
@Patch(':id/status')
updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateInviteStatusDto,
) {
  return this.inviteService.updateStatus(id, dto);
}



}
