// shared.module.ts
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { HeartBeat, HeartBeatSchema } from './schemas/heartbeat.schema';
import { MailService } from './mail/mail.service';
import { BusinessExistsConstraint } from './decorators/business-exists.validator';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';
@Global()
@Module({
  imports: [HttpModule,
   MongooseModule.forFeature([
    { name: HeartBeat.name, schema: HeartBeatSchema },
    { name: Business.name, schema: BusinessSchema },
  ]),
  ],
  providers: [MailService, BusinessExistsConstraint], 
  exports: [HttpModule,MongooseModule, MailService, BusinessExistsConstraint],
})  
export class SharedModule {}
