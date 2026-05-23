import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Blog } from './schema/blog.schema';

@Controller('blog')
export class BlogController {

constructor(private readonly blogService: BlogService) {}

@Post()
async create(@Body() body: CreateBlogDto) {
  // auto-generate slug if missing
  if (!body.pageSlug) {
    body.pageSlug = body.pageContent
      .toLowerCase()
      .replace(/\s+/g, '-') // spaces → hyphens
      .slice(0, 50);        // limit length
  }
  return this.blogService.create(body);
}

@Get()
  async findAll() {
    return this.blogService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.blogService.findOne(slug);
  }

@Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() body: Partial<Blog>,
  ) {
    return this.blogService.update(slug, body);
  }

   @Delete(':slug')
  async delete(@Param('slug') slug: string) {
    return this.blogService.delete(slug);
  }


}
