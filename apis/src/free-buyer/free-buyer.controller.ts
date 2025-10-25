import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FreeBuyerService } from './free-buyer.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { QueryBuyerDto } from './dto/query-buyer.dto';



@Controller('buyer-profile')
export class FreeBuyerController {
  constructor(private readonly freeBuyerService: FreeBuyerService) {}

  @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateBuyerDto, @User() user: any) {

        if (!user || !user.userId) {
            throw new BadRequestException('User not found');
        }
        return this.freeBuyerService.create(dto, user);
    }

     // 🔹 PUBLIC ROUTE – sab buyers ke records
    @Get('public')
    async getAllPublicBuyers() {
        return this.freeBuyerService.findAllPublic();
    }

    @UseGuards(JwtAuthGuard)
    @Get('')
    async getMyProfile(@Req() req) {
        const userId = req.user.userId || req.user.sub; // JWT se user ka ID
        return this.freeBuyerService.findOneByUser(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
        async update(
            @Param('id') id: string,
            @Body() dto: UpdateBuyerDto,
            @Req() req
        ) {
            const userId = req.user.userId || req.user.sub;
            return this.freeBuyerService.update(id, dto, userId);
        }
    
}

