// business-listing.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QueryBusinessDto } from './dto/query-business.dto';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { BusinessStatus, CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Nda, NdaDocument } from 'src/nda/schemas/nda.schema';

@Injectable()
export class BusinessListingService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
     @InjectModel(Nda.name) private readonly ndaModel: Model<NdaDocument>,
    private readonly notificationHelper: NotificationHelper,
  ) {}

  async findAllPublic(query: QueryBusinessDto, user?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { isDeleted: false, status: 'live' };

    // ✅ sirf apne user ke businesses
    if (user?.userId) {
      filter.ownerId = user.userId;
    }

    // ✅ search fields
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { businessName: regex },
        { businessType: regex },
        { entityType: regex },
        { city: regex },
        { state: regex },
        { country: regex },
      ];
    }

    // ✅ data fetch with
    const data = await this.businessModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'cim', 
      })
      .lean();

    const total = await this.businessModel.countDocuments(filter);

    return {
      total,
      page,
      limit,
      data,
    };
  }

 
  async findAll(query: QueryBusinessDto, user?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { isDeleted: false };

    // ✅ sirf apne user ke businesses
    if (user?.userId) {
      filter.ownerId = user.userId;
    }

    // ✅ search fields
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { businessName: regex },
        { businessType: regex },
        { entityType: regex },
        { city: regex },
        { state: regex },
        { country: regex },
      ];
    }

    // ✅ data fetch with
    const data = await this.businessModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'cim', 
      })
      .lean();

    const total = await this.businessModel.countDocuments(filter);

    return {
      total,
      page,
      limit,
      data,
    };
  }


  async create(dto: CreateBusinessDto, user: any): Promise<Business> {
     let imageBase64 = dto.image;
    if (imageBase64 && !imageBase64.startsWith("data:image")) {
    imageBase64 = `data:image/png;base64,${imageBase64}`;
  }
    const business = new this.businessModel({
                      ...dto,
                      createdBy: user.userId,
                      ownerId: user.userId,
                      isDeleted: false,
                      image: imageBase64,
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
  business[fileType] = fileUrl; 
  await business.save();

  return { message: 'File uploaded successfully', fileUrl };
}

// business-listing.service.ts
  async blockBusiness(businessId: string) {
    // Find the business
    const business = await this.businessModel.findById(businessId) as BusinessDocument;
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update status
    business.status = 'blocked';
    await business.save();

    // Create notification for the business owner
    await this.notificationHelper.createNotification({
      // new Types.ObjectId(commentDto.createdBy),
      userId: business.ownerId, 
      title: 'Business Blocked',
      message: `Your business has been blocked by admin.`,
      
    });

    return {
      message: 'Business blocked successfully',
      business,
    };
  }

  async unsubscribeBusiness(businessId: string) {
    // Find the business
    const business = await this.businessModel.findById(businessId) as BusinessDocument;
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update status
    business.status = BusinessStatus.PENDING_FOR_PAYMENT;
    await business.save();

  
    return {
      message: 'Business unsubscribed successfully',
      business,
    };
  }

  //  -----------------------------
    async updateBusinessStatus(businessId: string, status: string) {
    // Find the business
    const business = await this.businessModel.findById(businessId) as BusinessDocument;
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update status
    business.status = status;
    await business.save();

    // Create notification for the business owner
    await this.notificationHelper.createNotification({
      // new Types.ObjectId(commentDto.createdBy),
      userId: new Types.ObjectId(business.ownerId),
      title: `Business ${status}`,
      message: `Your business has been ${status}.`,
      
    });

    return {
      message: `Business ${status} successfully`,
      business,
    };
  }

    async getCounts(user: any): Promise<any> {
    const ownerId = user.userId;

    const totalBusinesses = await this.businessModel.countDocuments({ ownerId, isDeleted: false });
    const liveBusinesses = await this.businessModel.countDocuments({ ownerId, status: 'live', isDeleted: false });
    const pendingBusinesses = await this.businessModel.countDocuments({ ownerId, status: 'pending', isDeleted: false });
    const blockedBusinesses = await this.businessModel.countDocuments({ ownerId, status: 'blocked', isDeleted: false });
    const pendingNdaSubmiaaions = await this.ndaModel.countDocuments({ businessOwnerId:ownerId, ndaStatus: 'pending' });
    
    return {
      totalBusinesses,
      liveBusinesses, 
      pendingBusinesses,
      blockedBusinesses,
      pendingNdaSubmiaaions
  }
}

  async isOwner(userId: string, businessId: string): Promise<boolean> {
    const count = await this.businessModel.countDocuments({
      _id: new Types.ObjectId(businessId),
      ownerId: userId,
    });
    return count > 0;
  }

}