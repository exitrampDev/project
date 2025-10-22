import { PartialType } from '@nestjs/mapped-types';
import { CreateCimDto } from './create-cim.dto';

export class UpdateCimDto extends PartialType(CreateCimDto) {}