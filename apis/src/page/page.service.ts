import { Injectable } from '@nestjs/common';
import { Page, PageDocument } from './schema/page.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PageService {

     constructor(
    @InjectModel(Page.name)
    private pageModel: Model<PageDocument>,
  ) {}

  async findOne(slug: string): Promise<PageDocument | null> {
    return this.pageModel.findOne({ pageSlug: slug });
  }

   async findAll(): Promise<PageDocument[]> {
    return this.pageModel.find().exec();
  }

  async create(data: Partial<Page>): Promise<PageDocument> {
    const page = new this.pageModel(data);
    return page.save();
  }

  async update(slug: string, data: Partial<Page>): Promise<PageDocument | null> {
    return this.pageModel.findOneAndUpdate({ pageSlug: slug }, data, { new: true });
  }

  async delete(slug: string): Promise<PageDocument | null> {
    return this.pageModel.findOneAndDelete({ pageSlug: slug });
  }

}
