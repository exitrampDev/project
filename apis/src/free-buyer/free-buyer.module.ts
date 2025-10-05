import { Module } from '@nestjs/common';
import { FreeBuyerController } from './free-buyer.controller';
import { FreeBuyerService } from './free-buyer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Buyer, BuyerSchema } from './schemas/buyer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Buyer.name, schema: BuyerSchema }]),
  ],
  controllers: [FreeBuyerController],
  providers: [FreeBuyerService],
})
export class FreeBuyerModule {}

