import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DueDiligenceService } from './due-diligence.service';
import { CreateDueDiligenceDto } from './dto/create-due-diligence.dto';
import { UpdateDueDiligenceDto } from './dto/update-due-diligence.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { UsersService } from '../users/users.service';
import { NdaService } from 'src/nda/nda.service';
@Controller('due-diligence')
export class DueDiligenceController {
  constructor(
    private readonly dueDiligenceService: DueDiligenceService,
    private readonly usersService: UsersService,
    private readonly ndaService: NdaService
  ) {}
//   constructor(private readonly dueDiligenceService: DueDiligenceService) {}

  @Post()
  async create(@Body() dto: CreateDueDiligenceDto) {
    return this.dueDiligenceService.create(dto);
  }

  @Get()
  async findAll() {
    return this.dueDiligenceService.findAll();
  }

  // 👇 Changed from businessId → ndaId
  @UseGuards(JwtAuthGuard)
  @Get('nda/:ndaId')
  async findByNda(@Param('ndaId') ndaId: string, @User() user: any) {

  const dbUser = await this.usersService.findOne(user.userId);
   if (!dbUser) throw new NotFoundException('User not found');

   const nda = await this.ndaService.findOneByIdAndUserId(ndaId, user.userId); // Check if NDA exists, throws NotFoundException if not
   if (!nda) throw new NotFoundException(`NDA not found for ID ${ndaId}`);


    const records = await this.dueDiligenceService.findByNda(ndaId);
    if (!records || records.length === 0) {
      throw new NotFoundException(`No due diligence records found for NDA ${ndaId}`);
    }
    return records;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDueDiligenceDto) {
    return this.dueDiligenceService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.dueDiligenceService.delete(id);
  }

//   -------------------------------
@UseGuards(JwtAuthGuard)
@Post(':id/comments')
async addComment(
  @Param('id') id: string,
  @Body() addCommentDto: AddCommentDto,
  @User() user: any,
) {
  const dbUser = await this.usersService.findOne(user.userId);
  if (!dbUser) throw new NotFoundException('User not found');

  const author = `${dbUser.first_name} ${dbUser.last_name}`.trim();
  const dtoWithAuthor = { ...addCommentDto, author, createdBy: user.userId };

  console.log('Adding comment with DTO:', dtoWithAuthor);

  return this.dueDiligenceService.addComment(id, dtoWithAuthor);
}

}
