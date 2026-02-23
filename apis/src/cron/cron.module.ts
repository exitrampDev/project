import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BusinessListingModule } from 'src/business-listing/business-listing.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
    imports: [BusinessListingModule, UsersModule, PaymentModule],
    providers: [CronService],
})
export class CronModule {}
