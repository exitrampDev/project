import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreeSellerService } from './free-seller.service';
import { FreeSellerController } from './free-seller.controller';
import { Seller, SellerSchema } from './schemas/seller.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Seller.name, schema: SellerSchema },
    ]),
  ],
  controllers: [FreeSellerController],
  providers: [FreeSellerService],
  exports: [FreeSellerService], // agar dusre module me use karna hai
})
export class FreeSellerModule {}
