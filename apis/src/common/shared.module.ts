// shared.module.ts
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { HeartBeat, HeartBeatSchema } from './schemas/heartbeat.schema';
import { MailService } from './mail/mail.service';
import { BusinessExistsConstraint } from './decorators/business-exists.validator';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';
import { UniqueInCollectionConstraint } from './decorators/unique-in-collection.validator';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationHelper } from './helpers/notification.helper'; 
import { PaymentExistsValidator } from './decorators/payment-exists.validator';
import { Payment, PaymentSchema } from 'src/payment/schemas/payment.schema';
import { PaymentModule } from 'src/payment/payment.module';
import { PdfService } from './pdf/pdf.service';

@Global()
@Module({
  imports: [HttpModule,
   MongooseModule.forFeature([
    { name: HeartBeat.name, schema: HeartBeatSchema },
    { name: Business.name, schema: BusinessSchema },
    { name: Notification.name, schema: NotificationSchema },
    { name : Payment.name, schema : PaymentSchema }
  ]),
  ],
  providers: [PdfService, MailService, BusinessExistsConstraint, PaymentExistsValidator, UniqueInCollectionConstraint, NotificationHelper], 
  exports: [PdfService, HttpModule,MongooseModule, MailService, BusinessExistsConstraint, PaymentExistsValidator, UniqueInCollectionConstraint, NotificationHelper],
})  
export class SharedModule {}
