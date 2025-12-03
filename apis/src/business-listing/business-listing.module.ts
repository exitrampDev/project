import { Module } from '@nestjs/common';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingService } from './business-listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { Nda, NdaSchema } from 'src/nda/schemas/nda.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }, 
    { name: Nda.name, schema: NdaSchema },
  ]),

],
  controllers: [BusinessListingController],
  providers: [BusinessListingService, NotificationHelper],
  exports: [MongooseModule, BusinessListingService],
})
export class BusinessListingModule {}
