import { forwardRef, Module } from '@nestjs/common';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingService } from './business-listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { Nda, NdaSchema } from 'src/nda/schemas/nda.schema';
import { Recently, RecentlySchema } from 'src/recently-listing/schema/recently.schema';
import { InviteModule } from 'src/invite/invite.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }, 
    { name: Nda.name, schema: NdaSchema },
    {name: Recently.name, schema: RecentlySchema}
   
  ]),
   forwardRef(() => InviteModule),
],
  controllers: [BusinessListingController],
  providers: [BusinessListingService, NotificationHelper],
  exports: [MongooseModule, BusinessListingService],
})
export class BusinessListingModule {}
