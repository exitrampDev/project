import { IsString, IsOptional, IsArray, IsNumber, Matches, IsObject, IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { BusinessStatus } from './create-business.dto';


export class StatusBusinessDto {
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;
}
 