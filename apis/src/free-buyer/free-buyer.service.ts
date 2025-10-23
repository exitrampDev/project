import { ForbiddenException, Get, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Buyer, BuyerDocument } from './schemas/buyer.schema';
import { Model, Types } from 'mongoose';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';


@Injectable()
export class FreeBuyerService {
  constructor(
    @InjectModel(Buyer.name) private buyerModel: Model<BuyerDocument>,
  ) {}

  // 🔹 Public list – sab buyers ke records
    async findAllPublic(): Promise<BuyerDocument[]> {
      return this.buyerModel
        .find({ isDeleted: false })
        .select('-__v -isDeleted') // unnecessary fields hide karne ke liye
        .exec();
    }

   async findOneByUser(userId: string): Promise<BuyerDocument> {
    const record = await this.buyerModel.findOne({
      userId: userId,
      isDeleted: false,
    });


    if (!record) {
      throw new NotFoundException('No record found for this user');
    }

    return record;
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

