import { Controller, Post, Get, Param, Delete, Body, Query, Req, UseGuards, Patch, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { BusinessListingService } from './business-listing.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { QueryBusinessDto } from './dto/query-business.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('business-listing')
export class BusinessListingController {
  constructor(private readonly businessService: BusinessListingService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateBusinessDto, @User() user: any) {
      dto['userId'] = user.id;
        return this.businessService.create(dto, user);
    }

   
    @Get('public')
    async findAllPublic(@Query() query: QueryBusinessDto) {
    return this.businessService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Query() query: QueryBusinessDto) {
    return this.businessService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.businessService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateBusinessDto,
        @User() user: any,
    ) {
        return this.businessService.update(id, dto, user);
    }
    

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @User() user: any) {
      return this.businessService.remove(id, user);
    }
// -------------------------------Files Apis---------------------------------
  @UseGuards(JwtAuthGuard)
  @Post(':id/upload/:fileType')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // files stored in uploads folder
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadFile(
    @Param('id') businessId: string,
    @Param('fileType') fileType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
     // map param to DB field
    const validFields: Record<string, string> = {
        profit_loss: 'profitAndLossFile',
        balance_sheet: 'balanceSheetFile',
        three_year_tax_return: 'threeYearTaxReturnFile',
        ownership_or_cap_table: 'ownerShipCaptableFile',
    };

    const dbField = validFields[fileType];
    if (!dbField) {
        // throw new Error(`Invalid file type: ${fileType}`);
        // Return 404 if the fileType is not valid
        throw new NotFoundException(`File type '${fileType}' not found`);
    }

    const fileUrl = `/uploads/${file.filename}`; // Public URL
    return this.businessService.attachFile(businessId, fileUrl, dbField);
  }

}
