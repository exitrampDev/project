import { Controller, Post, Param, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
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
    }),
  )
  async uploadFile(@Param('businessId') businessId: string, @UploadedFile() file: Express.Multer.File) {
    const fileUrl = `/uploads/${file.filename}`;
    return this.filesService.saveFile(businessId, {
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
