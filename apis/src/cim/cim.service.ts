// business-listing.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cim, CimDocument } from './schemas/cim.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QueryCimDto } from './dto/query-cim.dto';
import { CreateCimDto } from './dto/create-cim.dto';
import { UpdateCimDto } from './dto/update-cim.dto';

@Injectable()
export class CimService {
  constructor(
    @InjectModel(Cim.name) private cimModel: Model<CimDocument>,
  ) {}

  async findAll(query: QueryCimDto, user?: any) {
    const baseFilter: any = { isDeleted: false };
    
    // If user is provided, only show businesses owned by that user
    if (user?.userId) {
      baseFilter.ownerId = user.userId;
    }

    const features = new ApiFeatures(this.cimModel);
    return features.paginateAndFilter({
      ...query,
      searchFields: ['businessName', 'businessType', 'entityType','city','state','country'],
       baseFilter: { isDeleted: false },
    });
  }

  async create(dto: CreateCimDto, user: any): Promise<Cim> {
     let imageBase64 = dto.image;
    if (imageBase64 && !imageBase64.startsWith("data:image")) {
    imageBase64 = `data:image/png;base64,${imageBase64}`;
  }
    const cim = new this.cimModel({
                      ...dto,
                      createdBy: user.userId,
                      ownerId: user.userId,
                      isDeleted: false,
                      image: imageBase64,
                       businessId: new Types.ObjectId(dto.businessId),
                    });
    return cim.save();
  }


  async findOne(id: string): Promise<Cim> {
    const cim = await this.cimModel.findById(id).exec();
    if (!cim) throw new NotFoundException(`Cim with ID ${id} not found`);
    return cim;
  }

 async remove(id: string, user: any) {
  const cim = await this.cimModel.findById(id);

  if (!cim) {
    throw new NotFoundException('Cim not found');
  }

  if (cim.ownerId.toString() !== user.userId) {
    throw new ForbiddenException('You are not allowed to delete this business');
  }

  cim.isDeleted = true;
  await cim.save();

  return { message: 'Cim deleted successfully' };
}

  async update(id: string, dto: UpdateCimDto, user: any) {
  const cim = await this.cimModel.findById(id);

  if (!cim) {
    throw new NotFoundException('Business not found');
  }

  // Only owner can update
  if (cim.ownerId.toString() !== user.userId) {
    throw new ForbiddenException('You are not allowed to update this Cim');
  }

  Object.assign(cim, dto, { updatedAt: new Date() });
  return cim.save();
}


async attachFile(businessId: string, fileUrl: string, fileType: string = 'profitAndLossFile') {
  const cim = await this.cimModel.findById(businessId);
  if (!cim) {
    throw new Error('Cim not found');
  }

  // You can store multiple files or specific keys (profitAndLossFile, etc.)
  cim[fileType] = fileUrl; // or push into array of files
  await cim.save();

  return { message: 'File uploaded successfully', fileUrl };
}



}
