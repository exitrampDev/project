import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File, FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<FileDocument>) {}

  async saveFile(businessId: string, fileData: Partial<File>): Promise<File> {
    const file = new this.fileModel({
      business: businessId,
      ...fileData,
    });
    return file.save();
  }

  async getFilesByBusiness(businessId: string) {
    return this.fileModel.find({ business: businessId }).exec();
  }
}
