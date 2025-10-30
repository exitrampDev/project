import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationHelper {
  private readonly logger = new Logger(NotificationHelper.name);

  constructor(
    private readonly mailService: MailService,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    link?: string;
  }) {
    const notification = new this.notificationModel({
      ...data,
      isRead: false,
      createdAt: new Date(),
    });
    return notification.save();
  }

  async sendNotification({
    userId,
    title,
    message,
    email,
    link,
  }: {
    userId: string;
    title: string;
    message: string;
    email?: string;
    link?: string;
  }) {
    // Save in MongoDB
    await this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      title,
      message,
      link,
    });

   
    this.logger.log(`Notification stored & sent to user ${userId}`);
    return { success: true };
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }
}
