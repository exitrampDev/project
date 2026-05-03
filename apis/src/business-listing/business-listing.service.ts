// business-listing.service.ts
import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Business, BusinessDocument } from './schemas/business.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QueryBusinessDto } from './dto/query-business.dto';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { BusinessStatus, CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Nda, NdaDocument } from 'src/nda/schemas/nda.schema';
import { RecentlyDocument, Recently } from 'src/recently-listing/schema/recently.schema';
import { InviteService } from 'src/invite/invite.service';

@Injectable()
export class BusinessListingService {
  constructor(
     @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
     @InjectModel(Nda.name) private readonly ndaModel: Model<NdaDocument>,
     @InjectModel(Recently.name) private readonly recentlyModel: Model<RecentlyDocument>,
     @Inject(forwardRef(() => InviteService))
     private inviteService: InviteService,
    private readonly notificationHelper: NotificationHelper,
  ) {}

  async findAllPublic(query: QueryBusinessDto, user?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      state,
      county,
      askingPrice,
      askingPriceMin,
      askingPriceMax,
      cashFlowMin,
      cashFlowMax,
      cashFlow,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { isDeleted: false, status: 'live' };

    // ✅ sirf apne user ke businesses
    if (user?.userId) {
      filter.ownerId = user.userId;
    }
    // -------------------------------------------------------------------------------------
  const andConditions: any[] = [];

  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Global text search (OR across multiple fields)
 */
if (search) {
  const regex = new RegExp(escapeRegex(search), 'i');

  andConditions.push({
    $or: [
      { industry: regex },
      { businessState: regex },
      { businessCountry: regex },
    ],
  });
}

if (industry) {
    andConditions.push({
      industry: new RegExp(escapeRegex(industry), 'i'),
    });
  }

  if (state) {
    andConditions.push({
      businessState: new RegExp(escapeRegex(state), 'i'),
    });
  }

  if (county) {
    andConditions.push({
      businessCountry: new RegExp(escapeRegex(county), 'i'),
    });
  }

  /**
   * Numeric filters
   */

   if (askingPrice !== undefined && !isNaN(Number(askingPrice))) {
    andConditions.push({
      askingPrice: Number(askingPrice),
    });
  }

  if (askingPriceMin !== undefined && !isNaN(Number(askingPriceMin))) {
    andConditions.push({
      askingPrice: { $gte: Number(askingPriceMin) },
    });
  }

  if (askingPriceMax !== undefined && !isNaN(Number(askingPriceMax))) {
    andConditions.push({
      askingPrice: { $lte: Number(askingPriceMax) },
    });
  }

  if (cashFlow !== undefined && !isNaN(Number(cashFlow))) {
    andConditions.push({
      cashFlow: Number(cashFlow),
    });
  }

  if (cashFlowMin !== undefined && !isNaN(Number(cashFlowMin))) {
    andConditions.push({
      cashFlow: { $gte: Number(cashFlowMin) },
    });
  }
  if (cashFlowMax !== undefined && !isNaN(Number(cashFlowMax))) {
    andConditions.push({
      cashFlow: { $lte: Number(cashFlowMax) },
    });
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }


    // ✅ data fetch with
    const data = await this.businessModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
    {
      path: 'ownerId',
      select: '-password -stripe_customer_id -payment_method -__v',
    },
    {
      path: 'cim',
    },
  ])
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
        { listingTitle: regex },
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


  async findLastPaymentOlderThan(date: Date) {
    try {
      return await this.businessModel.find({
        status: BusinessStatus.LIVE,
        isDeleted: false,
        $or: [
          { paymentDate: { $lt: date } },
          { paymentDate: null }
        ]
      }).lean();
    } catch (error: any) {
      throw new Error(`Failed to find businesses: ${error.message}`);
    }
  }

  async getAllPendingForPaymentBusiness(query: QueryBusinessDto, user?: any) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    const filter: any = { isDeleted: false , status: BusinessStatus.PENDING_FOR_PAYMENT };
 

    //  data fetch with
    const data = await this.businessModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
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
  let isFirstListing = await this.businessModel.find({ ownerId: user.userId }).countDocuments() == 0;

if(isFirstListing) {
  dto.status = BusinessStatus.LIVE;
}

  const business = new this.businessModel({
                      ...dto,
                      isFirstListing,
                      createdBy: user.userId,
                      ownerId: user.userId,
                      isDeleted: false,
                      image: imageBase64,
                    });
    return business.save();
  }


  async findOne(id: string): Promise<Business> {
    const business = await this.businessModel.findById(id)
     .populate({
      path: 'ownerId',
      select: '-password -stripe_customer_id -payment_method -__v',
    })
    .exec();
    if (!business) throw new NotFoundException(`Business with ID ${id} not found`);
    return business;
  }

async findOneWithUserNda(
  businessId: string,
  userId: string,
): Promise<any> {

  const business = await this.businessModel
    .findById(businessId)
  
    .populate([
      {
      path: 'ownerId',
      select: '-password -stripe_customer_id -payment_method -__v',
    },
      {
      path: 'ndas',
      match: { submittedBy: new Types.ObjectId(userId) },
    }])
    .lean()
    .exec();

  if (!business) {
    throw new NotFoundException(
      `Business with ID ${businessId} not found`,
    );
  }

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

  // Only owner can update invited user
   if (business.ownerId.toString() !== user.userId) {
    const canUpdate = await this.inviteService.canUpdateListing(user.userId, id);
    if (!canUpdate) {
      throw new ForbiddenException('You are not allowed to update this business');
    }
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
    business.status = BusinessStatus.UNSUBSCRIBE;
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

   async updateBusinessPaymentDate(businessId: string) {
    // Find the business
    const business = await this.businessModel.findById(businessId) as BusinessDocument;
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update status
    business.paymentDate = new Date();
    await business.save();

   
    return true;
  }

   async markBusinessAsPendingForPayment(businessId: string) {
    // Find the business
    const business = await this.businessModel.findById(businessId) as BusinessDocument;
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Update status
    business.status = BusinessStatus.PENDING_FOR_PAYMENT;
    await business.save();

   
    return true;
  }

    async getCounts(user: any): Promise<any> {
    const ownerId = user.userId;

    const totalBusinesses = await this.businessModel.countDocuments({ ownerId, isDeleted: false });
    const liveBusinesses = await this.businessModel.countDocuments({ ownerId, status: BusinessStatus.LIVE, isDeleted: false });
    const pendingBusinesses = await this.businessModel.countDocuments({ ownerId, status: BusinessStatus.PENDING_FOR_PAYMENT, isDeleted: false });
    const blockedBusinesses = await this.businessModel.countDocuments({ ownerId, status: BusinessStatus.BLOCK, isDeleted: false });
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

  async getAllBusinessesTotal() {
    return await this.businessModel.countDocuments({ isDeleted: false });
  }
   async getAllLiveBusinessesTotal() {
    return await this.businessModel.countDocuments({ isDeleted: false, status: BusinessStatus.LIVE });
  }

   async getAllMyBusinessesTotal(ownerId: string) {
    return await this.businessModel.countDocuments({ ownerId, isDeleted: false });
  }

   async getAllBuyerViewsOnMyListing(ownerId: string) {
     let myBusinesses = await this.businessModel.find({ ownerId: ownerId }).select('_id').exec();
    let myBusinessIds = myBusinesses.map(b => b._id);
    return await this.recentlyModel.countDocuments({ businessId: { $in: myBusinessIds } });
  }

 
}