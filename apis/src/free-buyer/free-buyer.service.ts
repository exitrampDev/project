import { ForbiddenException, Get, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Buyer, BuyerDocument } from './schemas/buyer.schema';
import { Model } from 'mongoose';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';


@Injectable()
export class FreeBuyerService {
  constructor(
    @InjectModel(Buyer.name) private buyerModel: Model<BuyerDocument>,
  ) {}

   async findOneByUser(userId: string): Promise<BuyerDocument | null> {
    return this.buyerModel.findOne({ userId, isDeleted: false }).exec();
  }

  async create(dto: CreateBuyerDto, user: any): Promise<Buyer> {
    const business = new this.buyerModel({
         ...dto,
         userId: user.userId,
        createdBy: user.userId,
        ownerId: user.userId,
        isDeleted: false,
      });
    return business.save();
  }

   async update(id: string, dto: UpdateBuyerDto, userId: string) {
    const buyer = await this.buyerModel.findById(id);

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    // ✅ Sirf apne hi record update karne ki permission
    if (buyer.userId.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this record');
    }

    Object.assign(buyer, dto);
    return buyer.save();
   }
}

