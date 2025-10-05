// shared.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { HeartBeat, HeartBeatSchema } from './schemas/heartbeat.schema';
import { MailService } from './mail/mail.service';

@Module({
  imports: [HttpModule,
     MongooseModule.forFeature([{ name: HeartBeat.name, schema: HeartBeatSchema }]),
  ],
  exports: [HttpModule,MongooseModule, MailService],
  providers: [MailService], 
})  
export class SharedModule {}
