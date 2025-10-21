import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlagController } from './flag.controller';
import { FlagService } from './flag.service';
import { Flag, FlagSchema } from './schemas/flag.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flag.name, schema: FlagSchema }])],
  controllers: [FlagController],
  providers: [FlagService],
})
export class FlagModule {}
