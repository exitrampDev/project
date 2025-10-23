import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Seller, SellerDocument } from './schemas/seller.schema';
import { Model, FilterQuery } from 'mongoose';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { QuerySellerDto } from './dto/query-seller.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class FreeSellerService {
  constructor(
    @InjectModel(Seller.name) private sellerModel: Model<SellerDocument>,
    ) {}
   
   //get ka kaam
   async findAll(query: QuerySellerDto, user?: any) {

    const baseFilter: any = { isDeleted: false };

    if(user){
       const userId = user.userId || user.sub || user.id;

    
    if (userId) {
      baseFilter.userId = userId;  
    }
    }
    const features = new ApiFeatures(this.sellerModel);
    return features.paginateAndFilter({
      ...query,
      searchFields: ['fullName', 'companyName', 'status', 'businessType'], 
      baseFilter,
    });
    }


  // Create seller
  async create(dto: CreateSellerDto, user: any): Promise<Seller> {
      const business = new this.sellerModel({
           ...dto,
           userId: user.userId,
          createdBy: user.userId,
          ownerId: user.userId,
          isDeleted: false,
        });
      return business.save();
    }  
  // Attach file to seller
  async attachFile(sellerId: string, fileUrl: string, fieldName: string): Promise<Seller | null> {
    return this.sellerModel.findByIdAndUpdate(
      sellerId,
      { [fieldName]: fileUrl },
      { new: true },
    ).exec();
  }
  //update  work
  async update(id: string, dto: UpdateSellerDto, user: any) {
    const seller = await this.sellerModel.findById(id);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }
    Object.assign(seller, dto);
    return seller.save();
}
   //delete ka kaam
async remove(id: string, user: any) {
  const seller = await this.sellerModel.findById(id);

  if (!seller) {
    throw new NotFoundException('Seller not found');
  }

  // Sirf owner apna record delete kar sake
  if (seller.userId.toString() !== user.userId) {
    throw new ForbiddenException('You are not allowed to delete this seller');
  }
  // Soft delete (DB me record mark as deleted)
  seller.isDeleted = true;
  await seller.save();

  return { message: 'Seller deleted successfully' };
}

}
