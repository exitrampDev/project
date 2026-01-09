import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BusinessListingModule } from 'src/business-listing/business-listing.module';

@Module({
    imports: [BusinessListingModule],
    providers: [CronService],
})
export class CronModule {}
