import { Module } from '@nestjs/common';
import { DueDiligenceController } from './due-diligence.controller';
import { DueDiligenceService } from './due-diligence.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DueDiligence, DueDiligenceSchema } from './schemas/due-diligence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DueDiligence.name, schema: DueDiligenceSchema },
    ]),
  ],
  controllers: [DueDiligenceController],
  providers: [DueDiligenceService],
  exports: [DueDiligenceService],
})
export class DueDiligenceModule {}
