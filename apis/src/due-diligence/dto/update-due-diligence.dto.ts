import { PartialType } from '@nestjs/mapped-types';
import { CreateDueDiligenceDto } from './create-due-diligence.dto';

export class UpdateDueDiligenceDto extends PartialType(CreateDueDiligenceDto) {}
