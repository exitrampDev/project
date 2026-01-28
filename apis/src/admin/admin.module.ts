import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BusinessListingModule } from 'src/business-listing/business-listing.module';
import { NdaModule } from 'src/nda/nda.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [BusinessListingModule, NdaModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
