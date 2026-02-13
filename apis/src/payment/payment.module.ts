import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentWebhookService } from './payment-webhook.service';
import { BusinessListingService } from 'src/business-listing/business-listing.service';
import { BusinessListingModule } from 'src/business-listing/business-listing.module';
import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports:[
     MongooseModule.forFeature([{ name : Payment.name, schema : PaymentSchema }]),
     BusinessListingModule,
     UsersModule,
     SharedModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentWebhookService, BusinessListingService],
  exports:[ PaymentService, MongooseModule ],
})
export class PaymentModule {}
