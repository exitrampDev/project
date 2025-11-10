import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag, FlagDocument } from './schemas/flag.schema';
import { CreateFlagDto } from './dto/create-flag.dto';
import { QueryFlagDto } from './dto/query-flag.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class FlagService {
  constructor(
    @InjectModel(Flag.name) private readonly flagModel: Model<FlagDocument>,
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
  const features = new ApiFeatures(this.flagModel);
  
  const {
    page = 1,
    limit = 10,
    search,
  } = query;

  const skip = (page - 1) * limit;
  const baseFilter = { isDeleted: false };

  if (search) {
    baseFilter['$or'] = [
      { description: new RegExp(search, 'i') },
      { userName: new RegExp(search, 'i') },
    ];
  }

  const pipeline = [
    { $match: baseFilter },
    {
      $addFields: {
        userId: { $toObjectId: "$userId" },
        businessId: { $toObjectId: "$businessId" }
      }
    },


  // Join user data
    {
      $lookup: {
        from: 'users',             
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

    //  Join business 
    {
      $lookup: {
        from: 'businesses',         
        localField: 'businessId',
        foreignField: '_id',
        as: 'business',
      },
    },
    { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$businessId",
        flagCount: { $sum: 1 },
        flags: { $push: "$$ROOT" }
      }
    },
    { $unwind: "$flags" },
    {
      $addFields: {
        "flags.flagCount": "$flagCount"
      }
    },
    { $replaceRoot: { newRoot: "$flags" } },
    { $sort: { createdAt: -1 } }, 
    { $skip: Number(skip) },
    { $limit: Number(limit) },
  ];

  const data = await this.flagModel.aggregate<any>(pipeline as any[]);

  const total = await this.flagModel.countDocuments(baseFilter);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data,
  };
}
}
