// shared.module.ts
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { HeartBeat, HeartBeatSchema } from './schemas/heartbeat.schema';
import { MailService } from './mail/mail.service';
import { BusinessExistsConstraint } from './decorators/business-exists.validator';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';
import { UniqueInCollectionConstraint } from './decorators/unique-in-collection.validator';
@Global()
@Module({
  imports: [HttpModule,
   MongooseModule.forFeature([
    { name: HeartBeat.name, schema: HeartBeatSchema },
    { name: Business.name, schema: BusinessSchema },
  ]),
  ],
  providers: [MailService, BusinessExistsConstraint, UniqueInCollectionConstraint], 
  exports: [HttpModule,MongooseModule, MailService, BusinessExistsConstraint, UniqueInCollectionConstraint],
})  
export class SharedModule {}
