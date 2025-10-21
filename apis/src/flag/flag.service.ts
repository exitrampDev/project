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
    // ✅ Check if user already flagged this business
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

 async findAll(query: QueryFlagDto) {
  const features = new ApiFeatures(this.flagModel);

  const result = await features.paginateAndFilter({
    ...query,
    searchFields: ['description'],
    baseFilter: { isDeleted: false },
  });

  // ✅ Populate userId and createdBy with full user details (no field limit)
  const populatedData = await this.flagModel.populate(result.data, [
    { path: 'userId' },        // will include all fields like first_name, last_name, email, etc.
    { path: 'createdBy' },
  ]);

  return {
    ...result,
    data: populatedData,
  };
}



}
