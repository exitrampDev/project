import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite-listing.controller';
import { FavoriteService } from './favorite-listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schema/favorite.schema';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';

@Module({
  imports: [
       MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema},
        { name: Business.name, schema: BusinessSchema }
       ]),
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService]
})
export class FavoriteListingModule {}



