// src/nda/nda.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Nda, NdaDocument } from './schemas/nda.schema';
import { CreateNdaDto } from './dto/create-nda.dto';
import { QueryNdaDto } from './dto/query-nda.dto';
import { Business, BusinessDocument } from 'src/business-listing/schemas/business.schema';

@Injectable()
export class NdaService {
  constructor(
    @InjectModel(Nda.name) private readonly ndaModel: Model<NdaDocument>,
     @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
  ) {}

  // User submits NDA
  async create(dto: { businessId: string }, userId: Types.ObjectId) {
    const existingNda = await this.ndaModel.findOne({
      businessId: dto.businessId,
      submittedBy: userId,
    });

    const business = await this.businessModel.findOne({
      _id: dto.businessId      
    });


    if (existingNda) {
      throw new BadRequestException('You have already applied');
    }

    const newNda = new this.ndaModel({
      businessId: dto.businessId,
      businessOwnerId: business?.ownerId,
      submittedBy: userId,
      status: 'pending',
    });

    return newNda.save();
  }

 
//find all ka kaam
  async findAll(query: QueryNdaDto, userId: string) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ndaStatus,
      cimStatus,
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    // Sirf current user ka data
    const matchFilter: any = { submittedBy: new Types.ObjectId(userId) };

    if (ndaStatus) matchFilter.status = ndaStatus;
    if (cimStatus) matchFilter.cimAccess = cimStatus;

    const aggregationPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1, businessType: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // 👉 Search ko lookup ke baad lagana hai (businessName ke liye)
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } }, // 👈 new
          ],
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          businessName: { $ifNull: ['$business.businessName', 'N/A'] },
          businessType: { $ifNull: ['$business.businessType', 'N/A'] },
          ndaStatus: '$status',
          cimAccess: 1,
          submittedOn: '$createdAt',
          sellerResponse: 1,
          message: 1,
          submittedByEmail: '$user.email',
          submittedByRole: { $ifNull: ['$user.role', 'N/A'] },
        },
      }
    );

    const data = await this.ndaModel.aggregate(aggregationPipeline).exec();

    // Count pipeline bhi search ko consider karega
    const countPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await this.ndaModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForOwner(query: QueryNdaDto, userId: string) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ndaStatus,
      cimStatus,
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    // Sirf current user ka data
    const matchFilter: any = { businessOwnerId: new Types.ObjectId(userId) };

    if (ndaStatus) matchFilter.status = ndaStatus;
    if (cimStatus) matchFilter.cimAccess = cimStatus;

    const aggregationPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1, businessType: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // 👉 Search ko lookup ke baad lagana hai (businessName ke liye)
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } }, // 👈 new
          ],
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          businessName: { $ifNull: ['$business.businessName', 'N/A'] },
          businessType: { $ifNull: ['$business.businessType', 'N/A'] },
          ndaStatus: '$status',
          cimAccess: 1,
          submittedOn: '$createdAt',
          sellerResponse: 1,
          message: 1,
          submittedByEmail: '$user.email',
          submittedByRole: { $ifNull: ['$user.role', 'N/A'] },
        },
      }
    );

    const data = await this.ndaModel.aggregate(aggregationPipeline).exec();

    // Count pipeline bhi search ko consider karega
    const countPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await this.ndaModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  ///reject ka kaam hai ye
  async rejectNda(ndaId: string, userId: string): Promise<Nda> {
    const nda = await this.ndaModel.findById(ndaId);
    if (!nda) throw new NotFoundException('NDA not found');

    // Check property owner
    const business = await this.businessModel.findById(nda.businessId);
    if (!business) throw new NotFoundException('Business not found');

    if (business.ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to reject this NDA');
    }

    nda.status = 'rejected';
    await nda.save();
    return nda;
  }
  //approve ka kaam hai ye 
  async approveNda(ndaId: string, userId: string): Promise<Nda>{
     const nda = await this.ndaModel.findById(ndaId);
     if(!nda) throw new NotFoundException("Nda Not Found");

     //property owmer ko check kar raha hun
     const business = await this.businessModel.findById(nda.businessId);
     if(!business) throw new NotFoundException("Business Not Found");
     
     if(business.ownerId.toString() !== userId){
      throw new ForbiddenException("You Are Not Authorized To Approve This Nda")
     }
     
     nda.status = 'approved';
     await nda.save();
     return nda;
  }


}
