// business-listing.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QueryBusinessDto } from './dto/query-business.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessListingService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}

  async findAll(query: QueryBusinessDto) {
    
    const features = new ApiFeatures(this.businessModel);
    return features.paginateAndFilter({
      ...query,
      searchFields: ['businessName', 'businessType', 'entityType','city','state','country'],
       baseFilter: { isDeleted: false },
    });
  }

  async create(dto: CreateBusinessDto, user: any): Promise<Business> {
     let imageBase64 = dto.image;
    if (imageBase64 && !imageBase64.startsWith("data:image")) {
    imageBase64 = `data:image/png;base64,${imageBase64}`;
    }
    
    const cimStatus = dto.businessType === 'seller_central';


    const business = new this.businessModel({
                      ...dto,
                      createdBy: user.userId,
                      ownerId: user.userId,
                      isDeleted: false,
                      image: imageBase64,
                      cimStatus,
                    });
    return business.save();
  }


  async findOne(id: string): Promise<Business> {
    const business = await this.businessModel.findById(id).exec();
    if (!business) throw new NotFoundException(`Business with ID ${id} not found`);
    return business;
  }

 async remove(id: string, user: any) {
  const business = await this.businessModel.findById(id);

  if (!business) {
    throw new NotFoundException('Business not found');
  }

  if (business.ownerId.toString() !== user.userId) {
    throw new ForbiddenException('You are not allowed to delete this business');
  }

  business.isDeleted = true;
  await business.save();

  return { message: 'Business deleted successfully' };
}

  async update(id: string, dto: UpdateBusinessDto, user: any) {
  const business = await this.businessModel.findById(id);

  if (!business) {
    throw new NotFoundException('Business not found');
  }

  // Only owner can update
  if (business.ownerId.toString() !== user.userId) {
    throw new ForbiddenException('You are not allowed to update this business');
  }

  Object.assign(business, dto, { updatedAt: new Date() });
  return business.save();
}


async attachFile(businessId: string, fileUrl: string, fileType: string = 'profitAndLossFile') {
  const business = await this.businessModel.findById(businessId);
  if (!business) {
    throw new Error('Business not found');
  }

  // You can store multiple files or specific keys (profitAndLossFile, etc.)
  business[fileType] = fileUrl; // or push into array of files
  await business.save();

  return { message: 'File uploaded successfully', fileUrl };
}



}
