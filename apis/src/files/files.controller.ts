import { Controller, Post, Param, UseInterceptors, UploadedFile, Get, Body, BadRequestException, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FilesService } from './files.service';
import { existsSync, unlinkSync } from 'fs';
import { BusinessListingService } from 'src/business-listing/business-listing.service';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private businessListingService:BusinessListingService) {}

   @UseGuards(JwtAuthGuard)
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
  @Body() dto: any,
   @User() user: any,
) {
  
  const fileUrl = `/uploads/${file.filename}`;
  if(dto.typeName == 'cim_file'){
    this.businessListingService.update(businessId, {
        'cimUrl': fileUrl,
      }, user);
  }


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

  // DELETE API to remove a file
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    const file = await this.filesService.findById(id);
    if (!file) throw new NotFoundException('File not found');

    // Delete file from disk
    const filePath = join(__dirname, '..', '..', 'uploads', file.filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Delete file record from DB
    await this.filesService.deleteFile(id);

    return { message: 'File deleted successfully' };
  }

  
}
