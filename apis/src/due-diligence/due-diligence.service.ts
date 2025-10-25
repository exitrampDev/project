import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DueDiligence } from './schemas/due-diligence.schema';

@Injectable()
export class DueDiligenceService {
  constructor(
    @InjectModel(DueDiligence.name)
    private readonly dueDiligenceModel: Model<DueDiligence>,
  ) {}

  async create(data: any) {
    return this.dueDiligenceModel.create(data);
  }

async findAll() {
  return this.dueDiligenceModel
    .find()
    // .populate('ndaId') //  reference matches schema
    .exec();
}

async findByNda(ndaId: string) {
  return this.dueDiligenceModel.find({ ndaId }).exec();
}

  async update(id: string, updateData: any) {
    return this.dueDiligenceModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string) {
    return this.dueDiligenceModel.findByIdAndDelete(id);
  }
}
