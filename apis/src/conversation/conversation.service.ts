import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
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
     .populate({ path: 'participants', model: 'User' , select:'first_name last_name email'})
    .exec();
}

async findAllMyConversations(user): Promise<ConversationDocument[]> {
  return this.conversationModel
    .find({
      participants: { $in: [user.userId] },
    })
    // .populate('participants')
     .populate({ path: 'participants', model: 'User' , select:'first_name last_name email'})
    .exec();
}

async findAllChatHistory(conversationId): Promise<MessageDocument[]> {
  return this.messageModel
    .find({
      conversationId:conversationId,
    })
    .populate({ path: 'senderId', model: 'User' , select:'first_name last_name email'})
    .exec();
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

    const message = new this.messageModel(createMessageDto);

    return await message.save();
    }
}
