import { 
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from 'src/common/decorators/user.decorator';
import { FreeSellerService } from './free-seller.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSellerDto } from './dto/create-seller.dto';
import { existsSync, mkdirSync } from 'fs';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { QuerySellerDto } from './dto/query-seller.dto';

@Controller('free-seller')
export class FreeSellerController {
  constructor(private readonly freeSellerService: FreeSellerService) {}

  @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateSellerDto, @User() user: any) {
      if (!user || !user.userId) {
        throw new BadRequestException('User not found');
      }
      return this.freeSellerService.create(dto, user);
    }
   //get ka kaam
   @UseGuards(JwtAuthGuard)
      @Get('')
      async findAll(@Query() query: QuerySellerDto) {
        return this.freeSellerService.findAll(query);
      }
  //update ka kaam
    @UseGuards(JwtAuthGuard)
          @Patch(':id')
          async update(
          @Param('id') id: string,
          @Body() dto: UpdateSellerDto,
          @User() user: any,
          ) {
      return this.freeSellerService.update(id, dto, user);
      }
  

    @UseGuards(JwtAuthGuard)
      @Post(':id/upload/:fileType')
      @UseInterceptors(
        FileInterceptor('file', {
          storage: diskStorage({
            destination: (req, file, cb) => {
              const uploadPath = './uploads/seller-profile';
              if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
              cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, uniqueSuffix + extname(file.originalname));
            },
          }),
          fileFilter: (req, file, cb) => {
            const fileType = req.params.fileType;

            if (fileType === 'image') {
              if (!file.mimetype.match(/\/(jpg|jpeg|png)$/i)) {
                return cb(new BadRequestException('Only JPG, JPEG, PNG allowed!'), false);
              }
            }

            if (fileType === 'pdf') {
              if (file.mimetype !== 'application/pdf') {
                return cb(new BadRequestException('Only PDF allowed!'), false);
              }
            }

            cb(null, true);
          },
          limits: {
            fileSize: 10 * 1024 * 1024, // max 10MB
          },
        }),
      )
      async uploadFile(
        @Param('id') businessId: string,
        @Param('fileType') fileType: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
      ) {
        if (!file) throw new BadRequestException('No file provided!');

        // Size check
        if (fileType === 'image' && file.size > 2 * 1024 * 1024) {
          throw new BadRequestException('Image must be less than 2MB!');
        }
        if (fileType === 'pdf' && file.size > 10 * 1024 * 1024) {
          throw new BadRequestException('PDF must be less than 10MB!');
        }

        const validFields: Record<string, string> = {
          image: 'imageFile',
          pdf: 'pdfFile',
        };

        const dbField = validFields[fileType];
        if (!dbField) throw new NotFoundException(`File type '${fileType}' not found`);

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/seller-profile/${file.filename}`;

        return this.freeSellerService.attachFile(businessId, fileUrl, dbField);
      }
      //delete ka kaam
      @UseGuards(JwtAuthGuard)
        @Delete(':id')
        async remove(@Param('id') id: string, @User() user: any) {
          return this.freeSellerService.remove(id, user);
        }
}
