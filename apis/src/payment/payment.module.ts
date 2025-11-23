import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentWebhookService } from './payment-webhook.service';

@Module({
  imports:[
     MongooseModule.forFeature([{ name : Payment.name, schema : PaymentSchema }])
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentWebhookService]
})
export class PaymentModule {}
