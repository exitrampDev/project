// src/common/utils/api-features.ts
import { Model, Document } from 'mongoose';

interface ApiQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
  searchFields?: string[];
  baseFilter?: Record<string, any>;
  populate?: string | string[]; // populate support
}

export class ApiFeatures<T extends Document> {
  constructor(private model: Model<T>) {}

  async paginateAndFilter(options: ApiQueryOptions) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search,
      searchFields = ['name', 'description'],
      baseFilter = { isDeleted: false },
      populate,
    } = options;

    const filter: any = { ...baseFilter };

    // Normal search on top-level fields
    if (search && searchFields.length > 0) {
      filter.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    let query = this.model.find(filter);

    // Populate nested documents
    if (populate) {
      query = query.populate(populate);
    }

    // Sorting
    query = query.sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    // Pagination
    query = query.skip((page - 1) * limit).limit(limit);

    // Execute query
    const data = await query;
    const total = await this.model.countDocuments(filter);

    return {
      total,
      page,
      limit,
      data,
    };
  }
}
