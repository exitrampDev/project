// src/nda/nda.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Req, UseGuards, Query } from '@nestjs/common';
import { NdaService } from './nda.service';
import { CreateNdaDto } from './dto/create-nda.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';
import { QueryNdaDto } from './dto/query-nda.dto';
import { RejectNdaDto } from './dto/reject-nda.dto';
import { ApproveNdaDto } from './dto/approve-nda.dto';

@Controller('nda')
export class NdaController {
  constructor(private readonly ndaService: NdaService) {}


  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateNdaDto, @Req() req: any) {
    console.log('req.user ===>', req.user);  

    
    const userId = new Types.ObjectId(req.user.userId);

    return this.ndaService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: QueryNdaDto, @Req() req: any) {
    // Abhi sirf string bhejenge (ObjectId service me convert hoga)
    const userId = req.user.userId;

    return this.ndaService.findAll(query, userId);
  }
  ///////
  @UseGuards(JwtAuthGuard)
  @Get('owner-submissions')
  async findAllForOwner(
    @Query() query: QueryNdaDto,
    @Req() req: any
  ) {
    
  const ownerId: string = req.user.userId;
  return this.ndaService.findAllForOwner(query, ownerId);
  }

  //reject ka kaam hai 
   @UseGuards(JwtAuthGuard) // JWT guard add karein
    @Patch('reject')
    async rejectNda(@Body() rejectNdaDto: RejectNdaDto, @Req() req: any) {
        const userId = req.user.userId; // ab defined hoga
        return await this.ndaService.rejectNda(rejectNdaDto.ndaId, userId);
    }  
     
    //approved ka kaam hai ye 
    @UseGuards(JwtAuthGuard) // JWT guard add karein
    @Patch('approve')
    async approveNda(@Body() ApproveDto: ApproveNdaDto, @Req() req: any) {
        const userId = req.user.userId; // ab defined hoga
        return await this.ndaService.approveNda(ApproveDto.ndaId, userId);
    }  

}