import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flag, FlagDocument } from './schemas/flag.schema';
import { CreateFlagDto } from './dto/create-flag.dto';
import { QueryFlagDto } from './dto/query-flag.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { Business, BusinessDocument } from 'src/business-listing/schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';

@Injectable()
export class FlagService {
  constructor(
    @InjectModel(Flag.name) private readonly flagModel: Model<FlagDocument>,
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    private readonly notificationHelper: NotificationHelper,
  ) {}

  async create(createFlagDto: CreateFlagDto) {
    // ✅ Check if user already flagged this 
    const existingFlag = await this.flagModel.findOne({
      userId: createFlagDto.userId,
      businessId: createFlagDto.businessId,
      isDeleted: false,
    });

    if (existingFlag) {
      throw new BadRequestException('You have already flagged this business.');
    }

    // Save new flag
    try {
      const flag = new this.flagModel(createFlagDto);
      //////////
      const business = await this.businessModel.findById(createFlagDto.businessId);

      if (business) {
        await this.notificationHelper.createNotification({
          // new Types.ObjectId(commentDto.createdBy),
          userId: new Types.ObjectId(business.ownerId),    
          title: 'Flag Submitted',
          message: `Someone flagged your business`,
        });
      }
      return await flag.save();
      

  
    } catch (error) {
      // handle unique index error
      if (error.code === 11000) {
        throw new BadRequestException('You have already flagged this business.');
      }
      throw error;
    }
  }

   async findAll(query: any) {
  const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const baseFilter: any = { isDeleted: false };

  if (search) {
    baseFilter['$or'] = [
      { description: new RegExp(search, 'i') },
    ];
  }

  const pipeline = [
    { $match: baseFilter },

    // Convert IDs to ObjectId for lookups
    {
      $addFields: {
        userId: { $toObjectId: "$userId" },
        businessId: { $toObjectId: "$businessId" }
      }
    },

    // Join with user
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

    // Join with business
    {
      $lookup: {
        from: "businesses",
        localField: "businessId",
        foreignField: "_id",
        as: "business"
      }
    },
    { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },

    // Convert business.ownerId
    {
      $addFields: {
        "business.ownerId": { $toObjectId: "$business.ownerId" }
      }
    },

    // Join business owner
    {
      $lookup: {
        from: "users",
        localField: "business.ownerId",
        foreignField: "_id",
        as: "businessOwner"
      }
    },
    { $unwind: { path: "$businessOwner", preserveNullAndEmptyArrays: true } },

    // Group by businessId → combine users into array
    {
      $group: {
        _id: "$businessId",
        flagCount: { $sum: 1 },
        users: {
          $push: {
            userId: "$user._id",
            first_name: "$user.first_name",
            last_name: "$user.last_name",
            email: "$user.email",
            description: "$description"
          }
        },
        business: { $first: "$business" },
        businessOwner: { $first: "$businessOwner" },
      }
    },

    // Sorting & pagination
    { $sort: { "business.createdAt": -1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) },
  ];

  const data = await this.flagModel.aggregate(pipeline as any[]);
  const total = await this.flagModel.countDocuments(baseFilter);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data,
  };
}


}
