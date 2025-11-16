import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
     constructor(private readonly paymentsService: PaymentService) {}

  @Post('create-checkout-session')
//   @UseGuards(JwtAuthGuard)
  async createCheckout(@Body() body: { amount: number; userId: string }) {
    const session = await this.paymentsService.createCheckoutSession(
      body.amount,
      body.userId,
    );

    return { url: session.url };
  }
}
