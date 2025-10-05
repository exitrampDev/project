import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RecentlyService } from './recently-listing.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { QueryRecentlyDto } from './dto/query-recently.dto';

@Controller('recently')
export class RecentlyController {
  constructor(private readonly recentlyService: RecentlyService){}


@UseGuards(JwtAuthGuard)
  @Post()
    async addToRecently(
      @Body('businessId') businessId: string,
      @User() user: any,
    ){
      return this.recentlyService.addToRecently(user.userId, businessId)
    }

@Get()
@UseGuards(JwtAuthGuard)
async findAll(@Query() query: QueryRecentlyDto, @User() user: any) {
  return this.recentlyService.findAll(query, user.userId);
}
@UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.recentlyService.remove(id, user);
  }      
}    
