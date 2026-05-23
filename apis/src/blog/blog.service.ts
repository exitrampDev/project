import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './schema/blog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogService {

      constructor(
        @InjectModel(Blog.name)
        private blogModel: Model<BlogDocument>,
      ) {}
    
      async findOne(slug: string): Promise<BlogDocument | null> {
        return this.blogModel.findOne({ pageSlug: slug });
      }
    
       async findAll(): Promise<BlogDocument[]> {
        return this.blogModel.find().exec();
      }
    
      async create(data: Partial<Blog>): Promise<BlogDocument> {
        const blog = new this.blogModel(data);
        return blog.save();
      }
    
      async update(slug: string, data: Partial<Blog>): Promise<BlogDocument | null> {
        return this.blogModel.findOneAndUpdate({ pageSlug: slug }, data, { new: true });
      }
    
      async delete(slug: string): Promise<BlogDocument | null> {
        return this.blogModel.findOneAndDelete({ pageSlug: slug });
      }
    
}
