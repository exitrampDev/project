import { Controller, Post, Get, Param, Delete, Body, Query, Req, UseGuards, Patch, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { CimService } from './cim.service';
import { CreateCimDto } from './dto/create-cim.dto';
import { QueryCimDto } from './dto/query-cim.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateCimDto } from './dto/update-cim.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('cim')
export class CimController {
  constructor(private readonly cimService: CimService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateCimDto, @User() user: any) {
      dto['userId'] = user.id;
        return this.cimService.create(dto, user);
    }

   
    @Get('public')
    async findAllPublic(@Query() query: QueryCimDto) {
    return this.cimService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Query() query: QueryCimDto,  @User() user: any) {
    return this.cimService.findAll(query, user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cimService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCimDto,
        @User() user: any,
    ) {
        return this.cimService.update(id, dto, user);
    }
    

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @User() user: any) {
      return this.cimService.remove(id, user);
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
    return this.cimService.attachFile(businessId, fileUrl, dbField);
  }

}
