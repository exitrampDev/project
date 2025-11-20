import { Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('payment')
export class PaymentController {
     constructor(private readonly paymentsService: PaymentService) {}

  @Post('create-checkout-session')
//   @UseGuards(JwtAuthGuard)
  async createCheckout(@Body() body: { amount: number; userId: string }) {
    const session = await this.paymentsService.createCheckoutSession(
      60, 'user_12345',
    );

    return { url: session.url };
  }
  //post ki hai 
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto:CreatePaymentDto, @Req() req:any){
      const userId = new Types.ObjectId(req.user.userId);
      return this.paymentsService.create(dto,userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Req() req:any, @Query() query: any){
       const userId = new Types.ObjectId(req.user.userId);
       return this.paymentsService.getByUser(req.user, query)
  }

  //admin get 
   @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAllPayments(@Req() req: any, @Query() query: any) {
      console.log("JWT payload:", req.user);  // ab show hoga

      return this.paymentsService.findAll(query);
    }

  //get id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentByID(@Param('id') id:string, @Req() req:any){
    const userId = new Types.ObjectId(req.user.userId);

    const payment = await this.paymentsService.getById(new Types.ObjectId(id));

    if(!payment){
       return { message: 'Payment Not Found'}
    }

    if(payment.userId.toString() !== userId.toString() && !req.user.admin){
      return {message:'Access Denied'}
    }
    return payment
  } 
}
