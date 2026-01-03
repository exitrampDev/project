// src/nda/nda.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NdaService } from './nda.service';
import { NdaController } from './nda.controller';
import { Nda, NdaSchema } from './schemas/nda.schema';
import { Business, BusinessSchema } from 'src/business-listing/schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nda.name, schema: NdaSchema }]),
     MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
     UsersModule
  ],
  controllers: [NdaController],
  providers: [NdaService, NotificationHelper],
  exports: [NdaService],
})
export class NdaModule {}
