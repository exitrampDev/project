import { Controller, Post, Param, UseInterceptors, UploadedFile, Get, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(':businessId/upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 15 * 1024 * 1024, //  15 MB in bytes
    },
    fileFilter: (req, file, cb) => {
        // ✅ Optional: Restrict to allowed file types
        const allowedTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
  }),
)
async uploadFile(
  @Param('businessId') businessId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: any
) {
  
  const fileUrl = `/uploads/${file.filename}`;
  return this.filesService.saveFile({
    businessId, // 👈 add this
    displayName: dto.displayName??file.filename,
    typeName: dto.typeName??'general',
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url: fileUrl,
  });
}


  @Get(':businessId')
  async getFiles(@Param('businessId') businessId: string) {
    return this.filesService.getFilesByBusiness(businessId);
  }
}
