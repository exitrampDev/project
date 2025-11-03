import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { NotificationService } from './notification.service';
import { NotificationHelper } from 'src/common/helpers/notification.helper';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService, 
private readonly notificationHelper: NotificationHelper

  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyNotifications(@User() user: any) {
    return this.notificationService.findByUser(user.userId);
  }

//   @UseGuards(JwtAuthGuard)
//   @Get()
//   async getUserNotifications(@User() user: any) {
//     return this.notificationHelper.getUserNotifications(user.userId);
//   }

  @UseGuards(JwtAuthGuard)
  @Get(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
