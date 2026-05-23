import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog, BlogSchema } from './schema/blog.schema';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
   imports: [
        MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    ],
  controllers: [BlogController],
  providers: [BlogService]
})
export class BlogModule {}
