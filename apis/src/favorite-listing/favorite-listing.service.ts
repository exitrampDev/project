// favorite.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schema/favorite.schema';
import { QueryFavoritesDto } from './dto/query-favorite.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { Business, BusinessDocument } from 'src/business-listing/schemas/business.schema';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}
  
    async findAll(query: QueryFavoritesDto, userId: string) {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    title,
    type,
    location,
    industry,
    state,
    savedOn,
  } = query;

  let businessIds: string[] = [];

  // ------------------------
  // Step 1: Business Filters
  // ------------------------
  if (search || title || type || location || industry || state) {
    const businessFilter: any = {};
    const orConditions: any[] = [];

    // General search
    if (search) {
      orConditions.push(
        { businessName: { $regex: search, $options: 'i' } },
        { businessType: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { generalManager: { $regex: search, $options: 'i' } },
        { ownerShipBreakdown: { $regex: search, $options: 'i' } },
      );
    }

    // Specific filters
    if (title) orConditions.push({ businessName: { $regex: title, $options: 'i' } });
    if (type) orConditions.push({ businessType: { $regex: type, $options: 'i' } });
    if (industry) orConditions.push({ entityType: { $regex: industry, $options: 'i' } });
    if (location) {
      orConditions.push(
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
      );
    }
    if (state) orConditions.push({ state: { $regex: state, $options: 'i' } });

    if (orConditions.length > 0) {
      businessFilter.$or = orConditions;
    }

    // Get matching businesses
    const matchingBusinesses = await this.businessModel
      .find(businessFilter)
      .select('_id')
      .lean(); // lean = better performance

    businessIds = [...new Set(matchingBusinesses.map((b) => b._id.toString()))];

    // Agar koi business match nahi hua
    if (businessIds.length === 0) {
      return { total: 0, page, limit, data: [] };
    }
  }

  // ------------------------
  // Step 2: Favorite Filters
  // ------------------------
  const filter: any = { userId }; // <-- yahan sirf userId use hoga

  if (businessIds.length > 0) {
    filter.businessId = { $in: businessIds };
  }

  // savedOn date filter
  if (savedOn) {
    const date = new Date(savedOn);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    filter.createdAt = { $gte: date, $lt: nextDate };
  }

  // ------------------------
  // Step 3: Fetch Data
  // ------------------------
  const total = await this.favoriteModel.countDocuments(filter);

  const data = await this.favoriteModel
    .find(filter)
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('businessId')
    .lean(); // lean = fast response

  return {
    total,
    page,
    limit,
    data,
  };
}



     //add record
    async addToFavorite(userId: string, businessId: string): Promise<any> {
      const existing = await this.favoriteModel.findOne({ userId, businessId });
      if (existing) {
        return {
        success: false,
        message: 'This business is already in favorites',
        data: existing,
      };
      }

      const favorite = new this.favoriteModel({
        userId: userId,       
        businessId: businessId,
      });

      return favorite.save();
    }
    //delete ka kaam
    async remove(id: string, userId: string) {
      // Find favorite by id **and** userId
      const favorite = await this.favoriteModel.findOne({ _id: id, userId });

      if (!favorite) {
        // Agar favorite nahi mila (ya dusre user ka hai)
        throw new NotFoundException('Favorite not found or you are not allowed to delete this favorite');
      }

      // Delete favorite
      await this.favoriteModel.findByIdAndDelete(id);

      return { message: 'Favorite deleted successfully' };
    }

    
  
}
