import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DueDiligence } from './schemas/due-diligence.schema';
import { AddCommentDto } from './dto/add-comment.dto';

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
  return this.dueDiligenceModel.find({ ndaId })
   .populate('comments.createdBy', 'first_name last_name email')
  .exec();
}

  async update(id: string, updateData: any) {
    return this.dueDiligenceModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string) {
    return this.dueDiligenceModel.findByIdAndDelete(id);
  }


async addComment(id: string, commentDto: AddCommentDto) {
  const due = await this.dueDiligenceModel.findById(id);
  if (!due) {
    throw new NotFoundException('Due diligence record not found');
  }

  // Ensure comments array exists
  if (!due.comments) {
    due.comments = [];
  }

  due.comments.push({
    author: commentDto.author,
    message: commentDto.message,
    createdBy: new Types.ObjectId(commentDto.createdBy),
    createdAt: new Date(),
  });

  return due.save();
}

}
