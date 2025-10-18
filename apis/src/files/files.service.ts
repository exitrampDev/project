import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File, FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  // async saveFile(businessId: string, fileData: Partial<File>): Promise<File> {
  //   const file = new this.fileModel({
  //     business: businessId,
  //     ...fileData,
  //   });
  //   return file.save();
  // }

  async   saveFile(fileData: any) {
    if (!fileData.businessId) {
  throw new BadRequestException('businessId is required');
}
  const file = new this.fileModel(fileData);
  return file.save();
}

  // async getFilesByBusiness(businessId: string) {
  //   return this.fileModel.find({ business: businessId }).exec();
  // }

async getFilesByBusiness(businessId: string) {
  return this.fileModel.find({ businessId }).exec();
}


async findById(id: string) {
  return this.fileModel.findById(id);
}

async deleteFile(id: string) {
  return this.fileModel.findByIdAndDelete(id);
}

}
