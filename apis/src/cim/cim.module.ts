import { Module } from '@nestjs/common';
import { CimController } from './cim.controller';
import { CimService } from './cim.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cim, CimSchema } from './schemas/cim.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cim.name, schema: CimSchema }])],
  controllers: [CimController],
  providers: [CimService]
})
export class CimModule {}
