import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FreeBuyerService } from './free-buyer.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { QueryBuyerDto } from './dto/query-buyer.dto';



@Controller('free-buyer')
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

    @Get('public')
        async findOnePublic() {
        return this.freeBuyerService.findOneByQuery();
    }

    @UseGuards(JwtAuthGuard)
        @Patch(':id')
        async update(
        @Param('id') id: string,
        @Body() dto: UpdateBuyerDto,
        @User() user: any,
        ) {
    return this.freeBuyerService.update(id, dto, user);
    }
    
}

