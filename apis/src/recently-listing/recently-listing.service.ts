import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Recently, RecentlyDocument } from './schema/recently.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QueryRecentlyDto } from './dto/query-recently.dto';
import { Business } from 'src/business-listing/schemas/business.schema';

@Injectable()
export class RecentlyService {
  constructor(
    @InjectModel(Recently.name) private recentlyModel: Model<RecentlyDocument>,
    @InjectModel(Business.name) private readonly businessModel: Model<Business>,
  ) {}

  async findAll(query: QueryRecentlyDto, userId: string) {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    businessName,
    businessType,
    status,
    state,
    askingPrice,
    revenue,
    savedOn,
  } = query;

  // ------------------------
  // Step 1: Business Filters
  // ------------------------
  const businessFilter: any = {};
  const orConditions: any[] = [];

  if (search) {
    orConditions.push(
      { businessName: { $regex: search, $options: 'i' } },
      { businessType: { $regex: search, $options: 'i' } },
      { entityType: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { status: { $regex: search, $options: 'i' } },
    );

    if (!isNaN(Number(search))) {
      const num = Number(search);
      orConditions.push(
        { askingPrice: num },
        { revenue: num },
        { cashFlow: num },
      );
    }

    const date = new Date(search);
    if (!isNaN(date.getTime())) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      orConditions.push({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    }
  }

  if (businessName) {
    orConditions.push({ businessName: { $regex: businessName, $options: 'i' } });
  }
  if (businessType) {
    orConditions.push({ businessType: { $regex: businessType, $options: 'i' } });
  }
  if (status) {
    orConditions.push({ status });
  }
  if (state) {
    orConditions.push({ state: { $regex: state, $options: 'i' } });
  }
  if (askingPrice) {
    businessFilter.askingPrice = { $gte: Number(askingPrice) };
  }
  if (revenue) {
    businessFilter.revenue = { $gte: Number(revenue) };
  }
  if (orConditions.length > 0) {
    businessFilter.$or = orConditions;
  }

  // ------------------------
  // Step 2: Recently Filters
  // ------------------------
  const filter: any = { userId };  // ✅ only current user's records
  if (savedOn) {
    const date = new Date(savedOn);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
  }

  // ------------------------
  // Step 3: Fetch Data
  // ------------------------
  const data = await this.recentlyModel
    .find(filter)
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: 'businessId',
      match: businessFilter,
    })
    .lean();

  // ✅ remove empty (business filter fail)
  const finalData = data.filter((d) => d.businessId);

  // ✅ total count bhi same tarike se calculate karo
  const totalDocs = await this.recentlyModel
    .find(filter)
    .populate({
      path: 'businessId',
      match: businessFilter,
    })
    .lean();

  const total = totalDocs.filter((d) => d.businessId).length;

  return {
    total,
    page,
    limit,
    data: finalData,
  };
}

  //add record
    async addToRecently(userId: string, businessId: string): Promise<any> {
      const existing = await this.recentlyModel.findOne({ userId, businessId });
      if (existing) {
        return {
        success: false,
        message: 'This recetly is already in favorites',
        data: existing,
      };
      }

      const recently = new this.recentlyModel({
        userId: userId,       
        businessId: businessId,
      });

      return recently.save();
    }
  //delete ka kaam
      async remove(id: string, user: any) {
    const record = await this.recentlyModel.findById(id);

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    // Ownership check
    if (record.userId.toString() !== user.userId) {
      throw new ForbiddenException('You cannot delete someone else’s record');
    }

    await record.deleteOne();
    return { message: 'Deleted successfully' };
  }
    
}
    
  

