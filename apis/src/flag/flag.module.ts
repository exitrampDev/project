import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlagController } from './flag.controller';
import { FlagService } from './flag.service';
import { Flag, FlagSchema } from './schemas/flag.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flag.name, schema: FlagSchema },
      { name: User.name, schema: UserSchema },         
      { name: Business.name, schema: BusinessSchema },
  ])],
  controllers: [FlagController],
  providers: [FlagService, NotificationHelper],
})
export class FlagModule {}
