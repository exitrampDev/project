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
      60, 'user_12345',
    );

    return { url: session.url };
  }
}
