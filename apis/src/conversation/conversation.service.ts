import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Conversation, ConversationDocument } from './schema/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findAllConversations(user): Promise<ConversationDocument[]> {
  return this.conversationModel
    .find()
    // .populate('participants')
     .populate({ path: 'participants', model: 'User' , select:'first_name last_name email user_type'})
    .exec();
}

async findAllMyConversations(user): Promise<ConversationDocument[]> {
  return this.conversationModel
    .find({
      participants: { $in: [user.userId] },
    })
    // .populate('participants')
     .populate({ path: 'participants', model: 'User' , select:'first_name last_name email user_type'})
    .exec();
}

async findAllChatHistory(conversationId): Promise<MessageDocument[]> {
  return this.messageModel
    .find({
      conversationId:new Types.ObjectId(conversationId),
    })
    .populate({ path: 'senderId', model: 'User' , select:'first_name last_name email user_type'})
    .exec();
}


 async sendAdminMessage( createMessageDto: CreateMessageDto, user: any): Promise<Message> {

    if (createMessageDto.conversationId) {
        const conversationExist = await this.conversationModel.findById(
            createMessageDto.conversationId,
          );

          if (!conversationExist) {
            throw new NotFoundException('Conversation not found');
          }
    }


  
    createMessageDto.conversationId  =  createMessageDto.conversationId;

    createMessageDto.senderId = user.userId;

    const message = new this.messageModel(createMessageDto);

    return await message.save();
    }

 async sendMessage( createMessageDto: CreateMessageDto, user: any): Promise<Message> {

    if (createMessageDto.conversationId) {
        const conversationExist = await this.conversationModel.findById(
            createMessageDto.conversationId,
          );

          if (!conversationExist) {
            throw new NotFoundException('Conversation not found');
          }
    }


    let conversation = await this.conversationModel.findOne({
            participants: {
                $all: [user.userId, createMessageDto.toUserId],
            },
        });

    if (!createMessageDto.conversationId) {
        if(createMessageDto.toUserId === user.userId) {
            throw new ForbiddenException("Cannot send message to yourself");
        }
        if (!createMessageDto.toUserId) {
            throw new ForbiddenException("Recipient user ID is required");
        }
        conversation = await this.conversationModel.create({
        participants: [user.userId, createMessageDto.toUserId],
        });
    }

    createMessageDto.conversationId =  conversation?._id.toString() ??   createMessageDto.conversationId;

    createMessageDto.senderId = user.userId;
    console.log('Sending message with data:', createMessageDto, 'from user:', user.userId);
    // const message = new this.messageModel(createMessageDto);
    const message = new this.messageModel({
                          ...createMessageDto,
                          senderId: new Types.ObjectId(user.userId),
                          conversationId: conversation?._id
                            ? new Types.ObjectId(conversation._id)
                            : new Types.ObjectId(createMessageDto.conversationId),
                        });

    return await message.save();
    }


    async markMessageAsRead(messageId: string, user: any){
      this.messageModel.findByIdAndUpdate(messageId, {
        $addToSet: { readersIds: user.userId },
      }, { new: true }).exec();

    }

    async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);

    const unreadCount = await this.messageModel.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
      senderId: { $ne:  new Types.ObjectId(userObjectId) },
      readersIds: { $nin:  new Types.ObjectId(userObjectId) },
    });
      return unreadCount;
    }
}
