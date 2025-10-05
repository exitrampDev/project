// favorite.controller.ts
import { Controller, Post, Delete, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { FavoriteService } from './favorite-listing.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { QueryFavoritesDto } from './dto/query-favorite.dto';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  //  Add to favorites
  @UseGuards(JwtAuthGuard)
  @Post()
  async addToFavorite(
    @Body('businessId') businessId: string,
    @User() user: any,
  ) {
    return this.favoriteService.addToFavorite(user.userId, businessId);
  }

  //  Get only logged-in user's favorites
  @UseGuards(JwtAuthGuard)
   @Get()
      async findAll(
        @Query() query: QueryFavoritesDto,
        @User() user: any,   // <-- user decorator add
      ) {
        return this.favoriteService.findAll(query, user.userId); 
    }
  

  // Delete only user's own favorite
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: any,
  ) {
    return this.favoriteService.remove(id, user.userId); // <-- userId pass kiya
  }
}
