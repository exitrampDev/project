import { Module } from '@nestjs/common';
import { RecentlyController } from './recently-listing.controller';
import { RecentlyService } from './recently-listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Recently, RecentlySchema } from './schema/recently.schema';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Recently.name, schema: RecentlySchema},
      { name: Business.name, schema: BusinessSchema },
    ])
  ],
  controllers: [RecentlyController],
  providers: [RecentlyService]
})
export class RecentlyListingModule {}
