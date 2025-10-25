import { Module } from '@nestjs/common';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingService } from './business-listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
  controllers: [BusinessListingController],
  providers: [BusinessListingService],
  exports: [MongooseModule, BusinessListingService],
})
export class BusinessListingModule {}
