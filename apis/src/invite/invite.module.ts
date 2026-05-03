import { Module, forwardRef  } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { Invite, InviteSchema } from './schema/invite.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { BusinessListingModule } from 'src/business-listing/business-listing.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
    UsersModule,
     forwardRef(() => BusinessListingModule),
    
  ],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
