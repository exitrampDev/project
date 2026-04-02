import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { PageService } from './page.service';
import { Page } from './schema/page.schema';
import { CreatePageDto } from './dto/create-page.dto';

@Controller('page')
export class PageController {
    constructor(private readonly pageService: PageService) {}

@Post()
async create(@Body() body: CreatePageDto) {
  // auto-generate slug if missing
  if (!body.pageSlug) {
    body.pageSlug = body.pageContent
      .toLowerCase()
      .replace(/\s+/g, '-') // spaces → hyphens
      .slice(0, 50);        // limit length
  }
  return this.pageService.create(body);
}

@Get()
  async findAll() {
    return this.pageService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.pageService.findOne(slug);
  }

@Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() body: Partial<Page>,
  ) {
    return this.pageService.update(slug, body);
  }

   @Delete(':slug')
  async delete(@Param('slug') slug: string) {
    return this.pageService.delete(slug);
  }

}
